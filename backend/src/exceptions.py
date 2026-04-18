class UserAlreadyExistsException(Exception):
    """Exception raised when trying to register a user with an email that already exists."""
    pass

class UserNotFoundException(Exception):
    """Exception raised when a user with a specific email is not found."""
    pass

class InvalidCredentialsException(Exception):
    """Exception raised when user authentication fails due to invalid credentials."""
    pass