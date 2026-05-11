import logging

from fastapi import Request
from fastapi.responses import JSONResponse

from src.exceptions import (
    AppException,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InvalidCredentialsException,
    UserAlreadyExistsException,
    UserNotFoundException,
    JWTHandlingException,
    ForecastGeneratingException
)

logger = logging.getLogger(__name__)

def register_exception_handlers(app):
    def _log_app_exception(request: Request, exc: AppException, status_code: int):
        logger.warning(
            "%s: status_code=%s detail=%s path=%s",
            exc.__class__.__name__,
            status_code,
            exc.detail,
            request.url.path,
        )

    @app.exception_handler(BadRequestError)
    async def bad_request_exception_handler(request: Request, exc: BadRequestError):
        _log_app_exception(request, exc, 400)
        return JSONResponse(status_code=400, content={"detail": exc.detail}, headers=exc.headers)

    @app.exception_handler(UnauthorizedError)
    async def unauthorized_exception_handler(request: Request, exc: UnauthorizedError):
        _log_app_exception(request, exc, 401)
        return JSONResponse(status_code=401, content={"detail": exc.detail}, headers=exc.headers)

    @app.exception_handler(ForbiddenError)
    async def forbidden_exception_handler(request: Request, exc: ForbiddenError):
        _log_app_exception(request, exc, 403)
        return JSONResponse(status_code=403, content={"detail": exc.detail}, headers=exc.headers)

    @app.exception_handler(NotFoundError)
    async def not_found_exception_handler(request: Request, exc: NotFoundError):
        _log_app_exception(request, exc, 404)
        return JSONResponse(status_code=404, content={"detail": exc.detail}, headers=exc.headers)

    @app.exception_handler(ConflictError)
    async def conflict_exception_handler(request: Request, exc: ConflictError):
        _log_app_exception(request, exc, 409)
        return JSONResponse(status_code=409, content={"detail": exc.detail}, headers=exc.headers)

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
        return JSONResponse(
                status_code=500,
                content={"detail": str(exc)}
        )

    @app.exception_handler(ForecastGeneratingException)
    async def forecast_generating_exception(request: Request, exc: ForecastGeneratingException):
        return JSONResponse(
                status_code=500,
                content={"detail": str(exc)},
        )