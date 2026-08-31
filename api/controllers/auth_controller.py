from fastapi import APIRouter, HTTPException, Request

from controllers.input_types import CreateCode, VerifyCode
from lib.ctx import auth
from views import AuthTokenView, CodeSentView

router = APIRouter(prefix="/auth", tags=["auth"])


def language_for_request(request: Request) -> str:
    host = (request.headers.get("x-forwarded-host") or request.headers.get("host") or "").lower()
    return "en" if host.split(":", 1)[0].removeprefix("www.") == "pricepanel.app" else "es"


@router.post("/codes", status_code=201)
def create_auth_code(data: CreateCode, request: Request):
    auth.send_code(data.email, language_for_request(request))
    return CodeSentView.render(data.email)


@router.post("/tokens", status_code=201)
def create_auth_token(data: VerifyCode, request: Request):
    result = auth.authenticate(data.email, data.code, language_for_request(request))
    if not result:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    return AuthTokenView.render(result)
