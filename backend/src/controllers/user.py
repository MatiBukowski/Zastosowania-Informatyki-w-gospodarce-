from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse

from src.security import TokenProvider
from src.services import UserService
from src.schemas import UserRegisterRequest, UserLoginRequest
from src.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/register", 
    summary="Register a new user", 
    description="Create a new user account"
)
def register_user(user: UserRegisterRequest, service: UserService = Depends(), token_provider: TokenProvider = Depends()):
    new_user = service.register_user(user)

    access_token = token_provider.generate_access_token(new_user)
    refresh_token = token_provider.generate_refresh_token(new_user)

    response = JSONResponse(
        content={"access_token": access_token},
        status_code=201
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


@router.post(
    "/login",
    summary="Login user",
    description="Authenticate user and return tokens"
)
def login_user(user: UserLoginRequest, service: UserService = Depends(), token_provider: TokenProvider = Depends()):
    authenticated_user = service.login_user(user)

    access_token = token_provider.generate_access_token(authenticated_user)
    refresh_token = token_provider.generate_refresh_token(authenticated_user)

    response = JSONResponse(
        content={"access_token": access_token},
        status_code=200
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


@router.post(
    "/refresh",
    summary="Refresh access token",
    description="Generate a new access token using the refresh token"
)
def refresh_token(request: Request, token_provider: TokenProvider = Depends()):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token is missing")

    new_access_token = token_provider.generate_access_token_from_refresh_token(refresh_token)

    return {"access_token": new_access_token}
