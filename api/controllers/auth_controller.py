from fastapi import APIRouter, HTTPException, Request

from controllers.input_types import CreateCode, VerifyCode
from controllers.public_request import request_ip
from lib import rate_limit
from lib.ctx import auth
from views import AuthTokenView, CodeSentView

router = APIRouter(prefix="/auth", tags=["auth"])


def language_for_request(request: Request) -> str:
    host = (request.headers.get("x-forwarded-host") or request.headers.get("host") or "").lower()
    return "en" if host.split(":", 1)[0].removeprefix("www.") == "pricepanel.app" else "es"


# Without limits /auth/codes could flood anyone's inbox and a 6-digit code
# could be guessed with enough tries (M16).
CODES_PER_EMAIL = 5
CODES_PER_IP = 20
FAILED_TRIES_PER_EMAIL = 5
WINDOW_SECONDS = 15 * 60
TOO_MANY_CODES = "Pediste demasiados códigos. Esperá unos minutos y probá de nuevo."
TOO_MANY_TRIES = "Demasiados intentos con un código equivocado. Pedí un código nuevo."


@router.post("/codes", status_code=201)
def create_auth_code(data: CreateCode, request: Request):
    ip = request_ip(request) or "unknown"
    if not rate_limit.allow(
        f"auth-code:email:{data.email}", CODES_PER_EMAIL, WINDOW_SECONDS
    ) or not rate_limit.allow(f"auth-code:ip:{ip}", CODES_PER_IP, WINDOW_SECONDS):
        raise HTTPException(status_code=429, detail=TOO_MANY_CODES)
    auth.send_code(data.email, language_for_request(request))
    # A fresh code gets fresh tries; the cap on codes above keeps this from
    # turning into unlimited guessing.
    rate_limit.forget(f"auth-token:email:{data.email}")
    return CodeSentView.render(data.email)


@router.post("/tokens", status_code=201)
def create_auth_token(data: VerifyCode, request: Request):
    failures = f"auth-token:email:{data.email}"
    if rate_limit.exceeded(failures, FAILED_TRIES_PER_EMAIL, WINDOW_SECONDS):
        raise HTTPException(status_code=429, detail=TOO_MANY_TRIES)
    result = auth.authenticate(data.email, data.code, language_for_request(request))
    if result:
        rate_limit.forget(failures)
        return AuthTokenView.render(result)
    rate_limit.allow(failures, FAILED_TRIES_PER_EMAIL, WINDOW_SECONDS)
    if rate_limit.exceeded(failures, FAILED_TRIES_PER_EMAIL, WINDOW_SECONDS):
        # That was the last allowed wrong guess: the outstanding code dies, so
        # guessing further is pointless until the inbox owner asks again.
        auth.invalidate_codes(data.email)
        raise HTTPException(status_code=429, detail=TOO_MANY_TRIES)
    raise HTTPException(status_code=400, detail="Invalid or expired code")
