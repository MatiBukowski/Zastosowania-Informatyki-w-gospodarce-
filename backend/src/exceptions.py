from fastapi import HTTPException


class UserAlreadyExistsException(Exception):
    """Exception raised when trying to register a user with an email that already exists."""
    pass

class UserNotFoundException(Exception):
    """Exception raised when a user with a specific email is not found."""
    pass

class InvalidCredentialsException(Exception):
    """Exception raised when user authentication fails due to invalid credentials."""
    pass

class JWTHandlingException(Exception):
    """General exception for JWT handling errors."""
    pass

class UnauthorisedUserException(HTTPException):
    """Exception raised when a user is unauthorised to perform an action."""
    def __init__(self, detail = None, headers = None) -> None:
        super().__init__(status_code=401, detail=detail, headers=headers)

class ForecastGeneratingException(Exception):
    """Exception raised when the forecast generator fails"""
    pass