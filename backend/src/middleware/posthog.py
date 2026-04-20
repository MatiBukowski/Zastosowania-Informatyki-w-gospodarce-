from fastapi import Request
from fastapi.responses import JSONResponse
from posthog import Posthog
from ..config import settings

posthog = Posthog(settings.POSTHOG_API_KEY, host=settings.POSTHOG_HOST)

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
    posthog.capture_exception(exc)
    return JSONResponse(status_code=500, content={'message': str(exc)})
