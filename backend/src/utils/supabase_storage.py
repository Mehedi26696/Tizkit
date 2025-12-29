"""
Supabase Storage Service for handling file uploads/downloads
"""

import os
import uuid
from typing import Optional, BinaryIO
from datetime import datetime
import httpx
from src.config import settings


class SupabaseStorageService:
    """Service for interacting with Supabase Storage"""
    
    BUCKET_NAME = "project-files"
    
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.service_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.storage_url = f"{self.supabase_url}/storage/v1"
        
    def _get_headers(self) -> dict:
        """Get authorization headers for Supabase API"""
        return {
            "Authorization": f"Bearer {self.service_key}",
            "apikey": self.service_key,
        }
    
    def _get_file_path(self, user_id: str, project_id: str, filename: str) -> str:
        """Generate organized file path: user_id/project_id/filename"""
        # Sanitize filename and add timestamp to prevent conflicts
        safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-")
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        name, ext = os.path.splitext(safe_filename)
        return f"{user_id}/{project_id}/{name}_{timestamp}_{unique_id}{ext}"
    
    async def ensure_bucket_exists(self) -> bool:
        """Ensure the project-files bucket exists"""
        async with httpx.AsyncClient() as client:
            # Check if bucket exists
            response = await client.get(
                f"{self.storage_url}/bucket/{self.BUCKET_NAME}",
                headers=self._get_headers()
            )
            
            if response.status_code == 200:
                return True
            
            # Create bucket if it doesn't exist
            response = await client.post(
                f"{self.storage_url}/bucket",
                headers=self._get_headers(),
                json={
                    "id": self.BUCKET_NAME,
                    "name": self.BUCKET_NAME,
                    "public": False,  # Private bucket, use signed URLs
                    "file_size_limit": 52428800,  # 50MB limit
                    "allowed_mime_types": [
                        "image/png",
                        "image/jpeg",
                        "image/gif",
                        "image/webp",
                        "application/pdf",
                        "text/plain",
                        "text/x-tex",
                        "application/x-tex",
                        "application/x-latex",
                    ]
                }
            )
            return response.status_code in [200, 201]
    
    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        user_id: str,
        project_id: str,
        content_type: str = "application/octet-stream"
    ) -> Optional[dict]:
        """
        Upload a file to Supabase Storage
        
        Returns:
            dict with 'path' and 'url' keys, or None if upload failed
        """
        file_path = self._get_file_path(user_id, project_id, filename)
        
        async with httpx.AsyncClient() as client:
            headers = self._get_headers()
            headers["Content-Type"] = content_type
            
            response = await client.post(
                f"{self.storage_url}/object/{self.BUCKET_NAME}/{file_path}",
                headers=headers,
                content=file_content
            )
            
            if response.status_code in [200, 201]:
                # Generate signed URL for access
                signed_url = await self.get_signed_url(file_path)
                return {
                    "path": file_path,
                    "url": signed_url,
                    "bucket": self.BUCKET_NAME
                }
            
            print(f"Upload failed: {response.status_code} - {response.text}")
            return None
    
    async def get_signed_url(self, file_path: str, expires_in: int = 3600) -> Optional[str]:
        """
        Get a signed URL for private file access
        
        Args:
            file_path: The path to the file in storage
            expires_in: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Signed URL string or None
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.storage_url}/object/sign/{self.BUCKET_NAME}/{file_path}",
                headers=self._get_headers(),
                json={"expiresIn": expires_in}
            )
            
            if response.status_code == 200:
                data = response.json()
                return f"{self.supabase_url}/storage/v1{data['signedURL']}"
            
            return None
    
    async def get_public_url(self, file_path: str) -> str:
        """Get public URL for a file (if bucket is public)"""
        return f"{self.storage_url}/object/public/{self.BUCKET_NAME}/{file_path}"
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete a file from storage"""
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.storage_url}/object/{self.BUCKET_NAME}/{file_path}",
                headers=self._get_headers()
            )
            return response.status_code in [200, 204]
    
    async def delete_project_files(self, user_id: str, project_id: str) -> bool:
        """Delete all files for a project"""
        prefix = f"{user_id}/{project_id}/"
        
        async with httpx.AsyncClient() as client:
            # List all files in the project folder
            response = await client.post(
                f"{self.storage_url}/object/list/{self.BUCKET_NAME}",
                headers=self._get_headers(),
                json={"prefix": prefix}
            )
            
            if response.status_code != 200:
                return False
            
            files = response.json()
            if not files:
                return True
            
            # Delete all files
            file_paths = [f["name"] for f in files]
            response = await client.delete(
                f"{self.storage_url}/object/{self.BUCKET_NAME}",
                headers=self._get_headers(),
                json={"prefixes": file_paths}
            )
            
            return response.status_code in [200, 204]
    
    async def list_project_files(self, user_id: str, project_id: str) -> list:
        """List all files in a project folder"""
        prefix = f"{user_id}/{project_id}/"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.storage_url}/object/list/{self.BUCKET_NAME}",
                headers=self._get_headers(),
                json={"prefix": prefix}
            )
            
            if response.status_code == 200:
                return response.json()
            return []
    
    async def download_file(self, file_path: str) -> Optional[bytes]:
        """Download a file from storage"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.storage_url}/object/{self.BUCKET_NAME}/{file_path}",
                headers=self._get_headers()
            )
            
            if response.status_code == 200:
                return response.content
            return None


# Singleton instance
storage_service = SupabaseStorageService()
