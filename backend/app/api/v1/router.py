from fastapi import APIRouter
from app.api.v1.routes import (
    auth,
    dashboard,
    org,
    assets,
    allocations,
    bookings,
    maintenance,
    audits,
    notifications,
    reports,
    activity_logs,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(org.router)
api_router.include_router(assets.router)
api_router.include_router(allocations.router)
api_router.include_router(bookings.router)
api_router.include_router(maintenance.router)
api_router.include_router(audits.router)
api_router.include_router(notifications.router)
api_router.include_router(reports.router)
api_router.include_router(activity_logs.router)
