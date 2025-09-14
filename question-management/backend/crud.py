from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
import models
import schemas
from auth import get_password_hash

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

# Question CRUD operations
def get_question(db: Session, question_id: int, include_deleted: bool = False):
    query = db.query(models.Question).filter(models.Question.id == question_id)
    if not include_deleted:
        query = query.filter(models.Question.is_deleted == False)
    return query.first()

def get_questions(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    difficulty: Optional[models.DifficultyLevel] = None,
    status: Optional[models.QuestionStatus] = None,
    include_deleted: bool = False
):
    query = db.query(models.Question)
    
    if not include_deleted:
        query = query.filter(models.Question.is_deleted == False)
    
    if subject:
        query = query.filter(models.Question.subject.ilike(f"%{subject}%"))
    
    if topic:
        query = query.filter(models.Question.topic.ilike(f"%{topic}%"))
    
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty)
    
    if status:
        query = query.filter(models.Question.status == status)
    
    return query.offset(skip).limit(limit).all()

def get_questions_count(
    db: Session,
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    difficulty: Optional[models.DifficultyLevel] = None,
    status: Optional[models.QuestionStatus] = None,
    include_deleted: bool = False
):
    query = db.query(models.Question)
    
    if not include_deleted:
        query = query.filter(models.Question.is_deleted == False)
    
    if subject:
        query = query.filter(models.Question.subject.ilike(f"%{subject}%"))
    
    if topic:
        query = query.filter(models.Question.topic.ilike(f"%{topic}%"))
    
    if difficulty:
        query = query.filter(models.Question.difficulty == difficulty)
    
    if status:
        query = query.filter(models.Question.status == status)
    
    return query.count()

def create_question(db: Session, question: schemas.QuestionCreate, user_id: int):
    db_question = models.Question(
        subject=question.subject,
        topic=question.topic,
        question=question.question,
        difficulty=question.difficulty,
        attachment_filename=question.attachment_filename,
        created_by=user_id,
        status=models.QuestionStatus.PROD
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def update_question(db: Session, question_id: int, question_update: schemas.QuestionUpdate, user_id: int):
    db_question = get_question(db, question_id)
    if db_question:
        update_data = question_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_question, field, value)
        
        db_question.updated_by = user_id
        db.commit()
        db.refresh(db_question)
    return db_question

def soft_delete_question(db: Session, question_id: int, user_id: int):
    db_question = get_question(db, question_id)
    if db_question:
        db_question.is_deleted = True
        db_question.updated_by = user_id
        db.commit()
        db.refresh(db_question)
    return db_question

def set_question_status(db: Session, question_id: int, status: models.QuestionStatus, user_id: int):
    db_question = get_question(db, question_id)
    if db_question:
        db_question.status = status
        db_question.updated_by = user_id
        db.commit()
        db.refresh(db_question)
    return db_question

# Audit Log operations
def create_audit_log(db: Session, question_id: int, user_id: int, action: str, changes_summary: Optional[str] = None):
    db_audit = models.AuditLog(
        question_id=question_id,
        user_id=user_id,
        action=action,
        changes_summary=changes_summary
    )
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return db_audit

def get_audit_logs(db: Session, question_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.AuditLog)
    if question_id:
        query = query.filter(models.AuditLog.question_id == question_id)
    return query.order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()