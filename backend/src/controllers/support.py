from fastapi import APIRouter, Depends, Request

from src.middleware.rate_limit import limiter
from src.schemas.support import (
    SupportContactRequest,
    SupportContactResponse,
    SupportInfoResponse,
)
from src.services.support import SupportService

router = APIRouter(prefix="/support", tags=["Support"])


@router.get(
    "/info",
    summary="Support contact info",
    description="Public support contact details and manager onboarding steps.",
)
def get_support_info(service: SupportService = Depends()) -> SupportInfoResponse:
    return service.get_info()


@router.post(
    "/contact",
    summary="Submit a support request",
    description="Send a manager support or account creation request to the team inbox.",
)
@limiter.limit("5/minute")
def submit_support_request(
    request: Request,
    payload: SupportContactRequest,
    service: SupportService = Depends(),
) -> SupportContactResponse:
    return service.send_contact_request(payload)
