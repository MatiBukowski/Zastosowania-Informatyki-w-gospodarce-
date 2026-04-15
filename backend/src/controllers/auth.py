from fastapi import APIRouter, Depends

from ..services import AuthService
from ..schemas import UserRegister

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
   "/register", 
   summary="Register a new user", 
   description="Create a new user account"
)
def register_user(user: UserRegister, service: AuthService = Depends()):
    return service.register_user(user)