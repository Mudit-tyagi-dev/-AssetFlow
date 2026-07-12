import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.backend = settings.STORAGE_BACKEND
        if self.backend == "s3" and settings.S3_ACCESS_KEY:
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                endpoint_url=settings.S3_ENDPOINT_URL or None
            )
        else:
            self.s3_client = None

    def generate_upload_url(self, filename: str, mime_type: str) -> dict:
        key = f"uploads/{filename}"
        if self.backend == "s3" and self.s3_client:
            try:
                response = self.s3_client.generate_presigned_post(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=key,
                    Fields={"Content-Type": mime_type},
                    Conditions=[{"Content-Type": mime_type}],
                    ExpiresIn=3600
                )
                return {"upload_url": response["url"], "fields": response["fields"], "key": key}
            except ClientError:
                pass
        
        # Local mock fallback
        return {
            "upload_url": f"http://localhost:8000/api/v1/storage/upload-mock",
            "fields": {"key": key, "Content-Type": mime_type},
            "key": key
        }

    def get_public_url(self, key: str) -> str:
        if not key:
            return ""
        if key.startswith("http://") or key.startswith("https://"):
            return key
        if self.backend == "s3" and self.s3_client:
            try:
                url = self.s3_client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
                    ExpiresIn=3600
                )
                return url
            except ClientError:
                pass
        return f"http://localhost:8000/static/{key}"

storage_service = StorageService()
