from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from . import TokenProvider
from src.models import UserRoleEnum, AppUser

class RoleChecker:
    def __init__(self, allowed_roles: list[UserRoleEnum]):
        self.allowed_roles = allowed_roles

    def __call__(self, token: HTTPAuthorizationCredentials = Depends(HTTPBearer()), token_provider: TokenProvider = Depends(TokenProvider)):
        user: AppUser = token_provider.get_current_user(token.credentials)
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions"
            )
        return user
