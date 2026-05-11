from __future__ import annotations


class AppException(Exception):
    """Base exception for application/domain errors.

    NOTE: This class intentionally contains no HTTP metadata.
    HTTP mapping is done in `exception_handler.py` based on exception type.
    """

    def __init__(self, detail: str, headers: dict[str, str] | None = None) -> None:
        super().__init__(detail)
        self.detail = detail
        self.headers = headers


class BadRequestError(AppException):
    """Represents invalid client input (HTTP 400)."""


class UnauthorizedError(AppException):
    """Represents missing/invalid auth (HTTP 401)."""


class ForbiddenError(AppException):
    """Represents insufficient permissions (HTTP 403)."""


class NotFoundError(AppException):
    """Represents missing resource (HTTP 404)."""


class ConflictError(AppException):
    """Represents a business rule conflict (HTTP 409)."""


# --- Domain-specific exceptions (prefer raising these from services) ---


class RestaurantNotFound(NotFoundError):
    pass


class MenuNotFound(NotFoundError):
    pass


class TableNotFound(NotFoundError):
    pass


class InvalidQrToken(NotFoundError):
    pass


class TableAlreadyExists(BadRequestError):
    pass


class OccupiedTableUpdateNotAllowed(BadRequestError):
    pass


class ReservationNotFound(NotFoundError):
    pass


class ReservationTimeConflict(ConflictError):
    pass


class OrderNotFound(NotFoundError):
    pass


class OrderOriginMismatch(ConflictError):
    pass


class MenuItemsNotFound(NotFoundError):
    pass


class MenuItemsUnavailable(ConflictError):
    pass


class NoOrderItemsProvided(BadRequestError):
    pass


class RefreshTokenMissing(UnauthorizedError):
    pass


class InsufficientPermissions(ForbiddenError):
    pass


class UserAlreadyExistsException(Exception):
    """Exception raised when trying to register a user with an email that already exists."""


class UserNotFoundException(Exception):
    """Exception raised when a user with a specific email is not found."""


class InvalidCredentialsException(Exception):
    """Exception raised when user authentication fails due to invalid credentials."""


class JWTHandlingException(Exception):
    """General exception for JWT handling errors."""


class UnauthorisedUserException(UnauthorizedError):
    """Exception raised when a user is unauthorised to perform an action."""

    def __init__(self, detail: str | None = None, headers: dict[str, str] | None = None) -> None:
        super().__init__(detail=detail or "Unauthorized", headers=headers)


class ForecastGeneratingException(Exception):
    """Exception raised when the forecast generator fails"""