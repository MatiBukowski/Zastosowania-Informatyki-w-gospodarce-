from fastapi import JSONResponse, Request

from backend.src.exceptions import (
    InvalidCredentialsException,
    UserAlreadyExistsException,
    UserNotFoundException
)

def register_exception_handlers(app):
    @app.exception_handler(UserAlreadyExistsException)
    async def user_already_exists_exception_handler(request: Request, exc: UserAlreadyExistsException):
        return JSONResponse(
                status_code=409,
                content={"detail": str(exc)}
        )
    
    @app.exception_handler(UserNotFoundException)
    async def user_not_found_exception_handler(request: Request, exc: UserNotFoundException):
        return JSONResponse(
                status_code=404,
                content={"detail": str(exc)}
        )
    
    @app.exception_handler(InvalidCredentialsException)
    async def invalid_credentials_exception_handler(request: Request, exc: InvalidCredentialsException):
        return JSONResponse(
                status_code=401,
                content={"detail": str(exc)}
        )