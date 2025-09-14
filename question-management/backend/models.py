from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.relationship import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class QuestionStatus(str, enum.Enum):
    PROD = "prod"
    DEVMT = "devmt"

class DifficultyLevel(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    questions = relationship("Question", back_populates="created_by_user")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False, index=True)
    topic = Column(String, nullable=False, index=True)
    question = Column(Text, nullable=False)  # Raw LaTeX content
    difficulty = Column(Enum(DifficultyLevel), nullable=False, index=True)
    status = Column(Enum(QuestionStatus), nullable=False, default=QuestionStatus.PROD, index=True)
    attachment_filename = Column(String, nullable=True)  # Original filename from JSON
    attachment_path = Column(String, nullable=True)      # Actual file path on server
    is_deleted = Column(Boolean, default=False, index=True)  # Soft delete
    
    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    created_by_user = relationship("User", back_populates="questions", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # CREATE, UPDATE, DELETE
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    changes_summary = Column(Text, nullable=True)  # Brief summary of changes
    
    # Relationships
    question = relationship("Question")
    user = relationship("User")