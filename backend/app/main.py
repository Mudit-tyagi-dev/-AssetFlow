from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router

# Initialize structured logging
setup_logging()

app = FastAPI(
    title="AssetFlow API",
    description="Multi-tenant Enterprise Asset & Resource Management ERP Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)



# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins="http://localhost:3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers mount
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"name": "AssetFlow Backend API", "status": "healthy"}
