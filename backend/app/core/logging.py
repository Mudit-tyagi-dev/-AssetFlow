import structlog
import logging
import sys
from contextvars import ContextVar

# ContextVar to store request_id across async calls
request_id_var = ContextVar("request_id", default=None)

def add_request_id(logger, method_name, event_dict):
    req_id = request_id_var.get()
    if req_id:
        event_dict["request_id"] = req_id
    return event_dict

def setup_logging():
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )
    
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            add_request_id,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer()
        ],
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

logger = structlog.get_logger()
