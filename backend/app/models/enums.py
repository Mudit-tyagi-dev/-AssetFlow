import enum

class OrgStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"

class UserRole(str, enum.Enum):
    admin = "admin"
    asset_manager = "asset_manager"
    department_head = "department_head"
    employee = "employee"

class UserStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"

class DepartmentStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"

class AssetCategoryStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"

class AssetCondition(str, enum.Enum):
    new = "new"
    good = "good"
    fair = "fair"
    poor = "poor"
    damaged = "damaged"

class AssetStatus(str, enum.Enum):
    available = "available"
    allocated = "allocated"
    reserved = "reserved"
    under_maintenance = "under_maintenance"
    lost = "lost"
    retired = "retired"
    disposed = "disposed"

class HolderType(str, enum.Enum):
    employee = "employee"
    department = "department"

class AllocationStatus(str, enum.Enum):
    active = "active"
    returned = "returned"
    transferred = "transferred"

class TransferStatus(str, enum.Enum):
    requested = "requested"
    approved = "approved"
    rejected = "rejected"

class BookingStatus(str, enum.Enum):
    upcoming = "upcoming"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"

class MaintenancePriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class MaintenanceStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    technician_assigned = "technician_assigned"
    in_progress = "in_progress"
    resolved = "resolved"

class AuditCycleStatus(str, enum.Enum):
    draft = "draft"
    in_progress = "in_progress"
    closed = "closed"

class AuditItemStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    missing = "missing"
    damaged = "damaged"
