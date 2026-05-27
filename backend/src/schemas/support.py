from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class SupportRequestType(str, Enum):
    ACCOUNT_CREATION = "account_creation"
    ACCESS_ISSUE = "access_issue"
    GENERAL = "general"


class SupportContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    request_type: SupportRequestType = SupportRequestType.ACCOUNT_CREATION
    message: str = Field(min_length=10, max_length=4000)
    restaurant_name: str | None = Field(default=None, max_length=200)
    source: str = Field(default="web", max_length=32)


class SupportContactResponse(BaseModel):
    message: str


class SupportInfoResponse(BaseModel):
    contact_email: str
    onboarding_steps: list[str]
