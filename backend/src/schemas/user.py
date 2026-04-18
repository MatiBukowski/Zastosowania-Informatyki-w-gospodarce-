from pydantic import BaseModel, EmailStr

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    surname: str

class UserLoginRequest(BaseModel):  
    email: EmailStr
    password: str