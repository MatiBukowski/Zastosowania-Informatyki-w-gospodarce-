from html import escape

import resend
from fastapi import HTTPException, status

from src.config import settings
from src.schemas.support import SupportContactRequest, SupportContactResponse, SupportInfoResponse


REQUEST_TYPE_LABELS = {
    "account_creation": "New manager account",
    "access_issue": "Access / permissions issue",
    "general": "General support",
}


class SupportService:
    def get_info(self) -> SupportInfoResponse:
        contact_email = settings.SUPPORT_CONTACT_EMAIL or settings.SUPPORT_TO_EMAIL
        return SupportInfoResponse(
            contact_email=contact_email,
            onboarding_steps=[
                "Submit a support request with your work email and restaurant name.",
                "Our team reviews the request and creates your manager account.",
                "You receive login credentials at the email address you provided.",
                "Sign in at the manager dashboard to manage tables, QR codes, and forecasts.",
            ],
        )

    def send_contact_request(self, payload: SupportContactRequest) -> SupportContactResponse:
        if not settings.RESEND_API_KEY or not settings.SUPPORT_TO_EMAIL:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Support email is not configured. Please try again later.",
            )

        resend.api_key = settings.RESEND_API_KEY
        request_label = REQUEST_TYPE_LABELS.get(payload.request_type.value, payload.request_type.value)
        restaurant_line = (
            f"<p><strong>Restaurant:</strong> {escape(payload.restaurant_name)}</p>"
            if payload.restaurant_name
            else ""
        )

        html_body = f"""
        <h2>Manager support request</h2>
        <p><strong>Type:</strong> {escape(request_label)}</p>
        <p><strong>Name:</strong> {escape(payload.name)}</p>
        <p><strong>Email:</strong> {escape(payload.email)}</p>
        <p><strong>Source:</strong> {escape(payload.source)}</p>
        {restaurant_line}
        <p><strong>Message:</strong></p>
        <p>{escape(payload.message).replace(chr(10), '<br>')}</p>
        """

        try:
            resend.Emails.send(
                {
                    "from": settings.SUPPORT_FROM_EMAIL,
                    "to": [settings.SUPPORT_TO_EMAIL],
                    "reply_to": payload.email,
                    "subject": f"[ZIWG Support] {request_label} — {payload.name}",
                    "html": html_body,
                }
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to send support request. Please try again later.",
            ) from exc

        return SupportContactResponse(
            message="Your support request has been sent. We will respond to your email shortly."
        )
