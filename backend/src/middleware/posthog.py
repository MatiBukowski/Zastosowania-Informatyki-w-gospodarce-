from fastapi import Request
from fastapi.responses import JSONResponse
from posthog import Posthog
from ..config import settings
import logging
import traceback

posthog = Posthog(settings.POSTHOG_API_KEY, host=settings.POSTHOG_HOST)
GENERIC_ERROR_DETAIL = "An unexpected error occurred. Please try again later."
logger = logging.getLogger("fastapi")


def report_exception(request: Request, exc: Exception, context: dict | None = None) -> None:
    logger.error(
        "Unhandled exception during %s %s: %s\n%s",
        request.method,
        request.url.path,
        exc,
        traceback.format_exc(),
    )

    properties = {
        "path": request.url.path,
        "method": request.method,
    }
    if context:
        properties.update(context)

    distinct_id = request.headers.get("x-posthog-distinct-id", "anonymous")
    posthog.capture_exception(exc, distinct_id=distinct_id, properties=properties)

async def posthog_middleware(request: Request, call_next):
    # Skip health checks for PostHog
    if request.url.path == "/api/health":
        return await call_next(request)
        
    distinct_id = request.headers.get("x-posthog-distinct-id", "anonymous")
    session_id = request.headers.get("x-posthog-session-id")
    
    response = await call_next(request)
    
    properties = {
        "$current_url": str(request.url),
        "method": request.method,
        "status_code": response.status_code,
    }
    if session_id:
        properties["$session_id"] = session_id
        
    posthog.capture(
        "api_request",
        distinct_id=distinct_id,
        properties=properties,
    )
    return response

async def http_exception_handler(request: Request, exc: Exception):
    report_exception(request, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": GENERIC_ERROR_DETAIL}
    )

