from fastapi import APIRouter, HTTPException
from lib.ctx import auth
from controllers.input_types import CreateCode, VerifyCode
from views import CodeSentView, AuthTokenView

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/codes", status_code=201)
def create_auth_code(data: CreateCode):
    auth.send_code(data.email)
    return CodeSentView.render(data.email)


@router.post("/tokens", status_code=201)
def create_auth_token(data: VerifyCode):
    result = auth.authenticate(data.email, data.code)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    return AuthTokenView.render(result)
