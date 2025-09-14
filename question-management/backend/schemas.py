from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole, QuestionStatus, DifficultyLevel

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    subject: str
    topic: str
    question: str
    difficulty: DifficultyLevel
    attachment_filename: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    subject: Optional[str] = None
    topic: Optional[str] = None
    question: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    attachment_filename: Optional[str] = None
    status: Optional[QuestionStatus] = None

class Question(QuestionBase):
    id: int
    status: QuestionStatus
    attachment_path: Optional[str] = None
    is_deleted: bool
    created_by: int
    created_at: datetime
    updated_by: Optional[int] = None
    updated_at: datetime
    
    class Config:
        from_attributes = True

# JSON Import Schema
class QuestionImport(BaseModel):
    subject: str
    topic: str
    question: str
    difficulty: DifficultyLevel
    attachment: Optional[str] = None  # filename

class QuestionsImport(BaseModel):
    questions: List[QuestionImport]

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Audit Log Schema
class AuditLog(BaseModel):
    id: int
    question_id: int
    user_id: int
    action: str
    timestamp: datetime
    changes_summary: Optional[str] = None
    
    class Config:
        from_attributes = True

# Response Schemas
class MessageResponse(BaseModel):
    message: str

class QuestionListResponse(BaseModel):
    questions: List[Question]
    total: int
    page: int
    size: int