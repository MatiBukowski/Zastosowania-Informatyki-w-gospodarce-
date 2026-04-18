from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from src.security import TokenProvider
from src.services import UserService
from src.schemas import UserRegister
from src.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/register", 
    summary="Register a new user", 
    description="Create a new user account"
)
def register_user(user: UserRegister, service: UserService = Depends(), token_provider: TokenProvider = Depends()):
    new_user = service.register_user(user)

    access_token = token_provider.generate_access_token(new_user)
    refresh_token = token_provider.generate_refresh_token(new_user)

    response = JSONResponse(
        content={"access_token": access_token}
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    return response
