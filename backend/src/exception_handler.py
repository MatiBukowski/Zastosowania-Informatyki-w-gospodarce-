from fastapi import JSONResponse, Request

from backend.src.exceptions import (
    UserAlreadyExistsException
)

def register_exception_handlers(app):
    @app.exception_handler(UserAlreadyExistsException)
    async def user_already_exists_exception_handler(request: Request, exc: UserAlreadyExistsException):
        return JSONResponse(
                status_code=409,
                content={"detail": str(exc)}
        )