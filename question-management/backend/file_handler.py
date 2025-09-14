import os
import shutil
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException
from decouple import config

UPLOAD_DIR = config('UPLOAD_DIR', default='../uploads')

def ensure_upload_dir():
    """Ensure upload directory exists"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_uploaded_file(file: UploadFile, original_filename: Optional[str] = None) -> str:
    """Save uploaded file and return the file path"""
    ensure_upload_dir()
    
    # Generate unique filename
    file_extension = ""
    if original_filename:
        _, file_extension = os.path.splitext(original_filename)
    elif file.filename:
        _, file_extension = os.path.splitext(file.filename)
    
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return file_path
    except Exception as e:
        # Clean up if file was partially created
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

def delete_file(file_path: str) -> bool:
    """Delete a file from the filesystem"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False

def get_file_path(filename: str) -> str:
    """Get full path for a filename in upload directory"""
    return os.path.join(UPLOAD_DIR, filename)

def file_exists(file_path: str) -> bool:
    """Check if file exists"""
    return os.path.exists(file_path)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'}

def validate_image_file(filename: str) -> bool:
    """Validate if file is an allowed image type"""
    if not filename:
        return False
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXTENSIONS