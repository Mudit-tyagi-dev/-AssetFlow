import uuid

try:
    from uuid_utils import uuid7 as _uuid7
    def uuid7() -> uuid.UUID:
        return uuid.UUID(bytes=_uuid7().bytes)
except ImportError:
    if hasattr(uuid, "uuid7"):
        uuid7 = uuid.uuid7
    else:
        def uuid7() -> uuid.UUID:
            # Fallback to uuid4 if uuid_utils is missing and stdlib doesn't have uuid7
            import uuid
            return uuid.uuid4()
