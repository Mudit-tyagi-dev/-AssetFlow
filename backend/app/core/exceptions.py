from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

class AssetFlowError(Exception):
    def __init__(self, message: str, code: str, status_code: int = 400, details: dict = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}

class AuthenticationError(AssetFlowError):
    def __init__(self, message: str = "Authentication failed", details: dict = None):
        super().__init__(message, "UNAUTHENTICATED", 401, details)

class ForbiddenError(AssetFlowError):
    def __init__(self, message: str = "Permission denied", details: dict = None):
        super().__init__(message, "FORBIDDEN", 403, details)

class NotFoundError(AssetFlowError):
    def __init__(self, message: str = "Resource not found", details: dict = None):
        super().__init__(message, "NOT_FOUND", 404, details)

class ConflictError(AssetFlowError):
    def __init__(self, message: str, code: str = "CONFLICT", details: dict = None):
        super().__init__(message, code, 409, details)

class AssetAlreadyAllocatedError(ConflictError):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "ASSET_ALREADY_ALLOCATED", details)

class BookingOverlapError(ConflictError):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "BOOKING_OVERLAP", details)

class InvalidStateTransitionError(ConflictError):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "INVALID_STATE_TRANSITION", details)

class CrossOrgAccessError(ForbiddenError):
    def __init__(self, message: str = "Cross-organization access is forbidden", details: dict = None):
        super().__init__(message, details)

class DependencyInUseError(ConflictError):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "DEPENDENCY_IN_USE", details)

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(AssetFlowError)
    async def assetflow_handler(request: Request, exc: AssetFlowError):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.message,
                "data": {
                    "code": exc.code,
                    "details": exc.details
                }
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "Validation failed",
                "data": {
                    "code": "VALIDATION_ERROR",
                    "details": {"errors": exc.errors()}
                }
            }
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_handler(request: Request, exc: StarletteHTTPException):
        # Translate generic HTTP exceptions
        code = "NOT_FOUND" if exc.status_code == 404 else f"HTTP_{exc.status_code}"
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail,
                "data": {
                    "code": code,
                    "details": {}
                }
            }
        )

    @app.exception_handler(Exception)
    async def global_handler(request: Request, exc: Exception):
        from app.core.logging import logger
        logger.exception("Unexpected error occurred", error=str(exc))
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "An unexpected error occurred. Please contact support.",
                "data": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "details": {}
                }
            }
        )
