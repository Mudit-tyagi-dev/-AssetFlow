import uuid
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging, logger, request_id_var

# Initialize structured logging
setup_logging()

app = FastAPI(
    title="AssetFlow API",
    description="Multi-tenant Enterprise Asset & Resource Management ERP Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Wire up global domain exception handling
register_exception_handlers(app)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middleware for Request ID Tracking and execution logs
@app.middleware("http")
async def add_request_id_and_log(request: Request, call_next):
    # Read or generate Request ID
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request_id_var.set(req_id)
    
    start_time = time.time()
    
    logger.info("Request started", method=request.method, path=request.url.path)
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(
            "Request finished",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration=f"{process_time:.4f}s"
        )
        response.headers["X-Request-ID"] = req_id
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            "Request failed",
            method=request.method,
            path=request.url.path,
            error=str(e),
            duration=f"{process_time:.4f}s"
        )
        raise

# API Routers mount
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"name": "AssetFlow Backend API", "status": "healthy"}
