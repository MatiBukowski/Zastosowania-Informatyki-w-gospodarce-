from fastapi import Request
from fastapi.responses import JSONResponse

from src.exceptions import (
    InvalidCredentialsException,
    UserAlreadyExistsException,
    UserNotFoundException,
    JWTHandlingException,
    UnauthorisedUserException,
    ForecastGeneratingException
)

import logging
import traceback
from src.middleware import posthog

logger = logging.getLogger("fastapi")

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
    
    @app.exception_handler(JWTHandlingException)
    async def jwt_handling_exception_handler(request: Request, exc: JWTHandlingException):
        logger.error(f"JWT Handling exception: {exc}\n{traceback.format_exc()}")
        distinct_id = request.headers.get("x-posthog-distinct-id", "anonymous")
        posthog.capture_exception(
            exc,
            distinct_id=distinct_id,
            properties={"path": request.url.path, "method": request.method}
        )
        return JSONResponse(
                status_code=500,
                content={"detail": "An unexpected error occurred. Please try again later."}
        )

    @app.exception_handler(UnauthorisedUserException)
    async def unauthorised_user_exception_handler(request: Request, exc: UnauthorisedUserException):
        return JSONResponse(
                status_code=exc.status_code,
                content={"detail": str(exc)},
                headers=exc.headers
        )

    @app.exception_handler(ForecastGeneratingException)
    async def forecast_generating_exception(request: Request, exc: ForecastGeneratingException):
        logger.error(f"Forecast Generating exception: {exc}\n{traceback.format_exc()}")
        distinct_id = request.headers.get("x-posthog-distinct-id", "anonymous")
        posthog.capture_exception(
            exc,
            distinct_id=distinct_id,
            properties={"path": request.url.path, "method": request.method}
        )
        return JSONResponse(
                status_code=500,
                content={"detail": "An unexpected error occurred. Please try again later."}
        )