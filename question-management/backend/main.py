from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional
import json
import os

import models
import schemas
import crud
import auth
from database import engine, get_db
from audit_logger import log_question_change, get_question_audit_history
from file_handler import save_uploaded_file, delete_file, validate_image_file, get_file_path

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Question Management System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication routes
@app.post("/api/auth/login", response_model=schemas.Token)
async def login(login_request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, login_request.username, login_request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

# User management routes (Admin only)
@app.post("/api/users", response_model=schemas.User)
async def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_user(db=db, user=user)

@app.get("/api/users", response_model=List[schemas.User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    return crud.get_users(db, skip=skip, limit=limit)

# Question routes
@app.get("/api/questions", response_model=schemas.QuestionListResponse)
async def read_questions(
    skip: int = 0,
    limit: int = 100,
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    difficulty: Optional[models.DifficultyLevel] = None,
    status: Optional[models.QuestionStatus] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role)
):
    # Viewers can only see prod questions
    if current_user.role == models.UserRole.VIEWER:
        status = models.QuestionStatus.PROD
    
    questions = crud.get_questions(
        db, skip=skip, limit=limit, subject=subject, topic=topic,
        difficulty=difficulty, status=status
    )
    total = crud.get_questions_count(
        db, subject=subject, topic=topic, difficulty=difficulty, status=status
    )
    
    return {
        "questions": questions,
        "total": total,
        "page": skip // limit + 1,
        "size": limit
    }

@app.get("/api/questions/{question_id}", response_model=schemas.Question)
async def read_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_any_role)
):
    question = crud.get_question(db, question_id=question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Viewers can only see prod questions
    if current_user.role == models.UserRole.VIEWER and question.status != models.QuestionStatus.PROD:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return question

@app.post("/api/questions", response_model=schemas.Question)
async def create_question(
    question: schemas.QuestionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_editor_or_admin)
):
    db_question = crud.create_question(db=db, question=question, user_id=current_user.id)
    
    # Log the creation
    log_question_change(
        question_id=db_question.id,
        user_id=current_user.id,
        username=current_user.username,
        action="CREATE",
        new_data=question.dict(),
        summary=f"Question created: {question.subject} - {question.topic}"
    )
    
    crud.create_audit_log(db, db_question.id, current_user.id, "CREATE", "Question created")
    
    return db_question

@app.put("/api/questions/{question_id}", response_model=schemas.Question)
async def update_question(
    question_id: int,
    question_update: schemas.QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_editor_or_admin)
):
    # Get original question for audit logging
    original_question = crud.get_question(db, question_id=question_id)
    if original_question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Store original data for diff
    original_data = {
        "subject": original_question.subject,
        "topic": original_question.topic,
        "question": original_question.question,
        "difficulty": original_question.difficulty.value,
        "status": original_question.status.value,
        "attachment_filename": original_question.attachment_filename
    }
    
    # Set question to development status when editing
    if question_update.status is None:
        question_update.status = models.QuestionStatus.DEVMT
    
    db_question = crud.update_question(db=db, question_id=question_id, question_update=question_update, user_id=current_user.id)
    
    # Prepare new data for diff
    new_data = {
        "subject": db_question.subject,
        "topic": db_question.topic,
        "question": db_question.question,
        "difficulty": db_question.difficulty.value,
        "status": db_question.status.value,
        "attachment_filename": db_question.attachment_filename
    }
    
    # Log the update with diff
    log_question_change(
        question_id=db_question.id,
        user_id=current_user.id,
        username=current_user.username,
        action="UPDATE",
        old_data=original_data,
        new_data=new_data,
        summary=f"Question updated: {db_question.subject} - {db_question.topic}"
    )
    
    crud.create_audit_log(db, db_question.id, current_user.id, "UPDATE", "Question updated")
    
    return db_question

@app.delete("/api/questions/{question_id}", response_model=schemas.MessageResponse)
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_editor_or_admin)
):
    question = crud.get_question(db, question_id=question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    
    crud.soft_delete_question(db=db, question_id=question_id, user_id=current_user.id)
    
    # Log the deletion
    log_question_change(
        question_id=question_id,
        user_id=current_user.id,
        username=current_user.username,
        action="DELETE",
        summary=f"Question soft deleted: {question.subject} - {question.topic}"
    )
    
    crud.create_audit_log(db, question_id, current_user.id, "DELETE", "Question deleted")
    
    return {"message": "Question deleted successfully"}

@app.put("/api/questions/{question_id}/status", response_model=schemas.Question)
async def update_question_status(
    question_id: int,
    status: models.QuestionStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_editor_or_admin)
):
    question = crud.get_question(db, question_id=question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    
    old_status = question.status.value
    db_question = crud.set_question_status(db=db, question_id=question_id, status=status, user_id=current_user.id)
    
    # Log status change
    log_question_change(
        question_id=question_id,
        user_id=current_user.id,
        username=current_user.username,
        action="STATUS_CHANGE",
        old_data={"status": old_status},
        new_data={"status": status.value},
        summary=f"Status changed from {old_status} to {status.value}"
    )
    
    crud.create_audit_log(db, question_id, current_user.id, "STATUS_CHANGE", f"Status changed to {status.value}")
    
    return db_question

# File upload routes
@app.post("/api/upload", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_editor_or_admin)
):
    if not validate_image_file(file.filename):
        raise HTTPException(status_code=400, detail="Invalid file type. Only image files are allowed.")
    
    try:
        file_path = save_uploaded_file(file, file.filename)
        return {
            "filename": file.filename,
            "file_path": file_path,
            "message": "File uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/{file_path:path}")
async def get_file(file_path: str):
    full_path = get_file_path(file_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(full_path)

# Import/Export routes
@app.post("/api/questions/import", response_model=schemas.MessageResponse)
async def import_questions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_editor_or_admin)
):
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="File must be a JSON file")
    
    try:
        content = await file.read()
        data = json.loads(content)
        
        # Validate JSON structure
        if not isinstance(data, dict) or 'questions' not in data:
            raise HTTPException(status_code=400, detail="Invalid JSON format. Expected {'questions': [...]}")
        
        questions_data = data['questions']
        if not isinstance(questions_data, list):
            raise HTTPException(status_code=400, detail="Questions must be an array")
        
        imported_count = 0
        errors = []
        
        for i, question_data in enumerate(questions_data):
            try:
                # Validate required fields
                required_fields = ['subject', 'topic', 'question', 'difficulty']
                for field in required_fields:
                    if field not in question_data:
                        errors.append(f"Question {i+1}: Missing required field '{field}'")
                        continue
                
                # Create question schema
                question_create = schemas.QuestionCreate(
                    subject=question_data['subject'],
                    topic=question_data['topic'],
                    question=question_data['question'],
                    difficulty=models.DifficultyLevel(question_data['difficulty']),
                    attachment_filename=question_data.get('attachment')
                )
                
                # Create question in database
                db_question = crud.create_question(db=db, question=question_create, user_id=current_user.id)
                
                # Log import
                log_question_change(
                    question_id=db_question.id,
                    user_id=current_user.id,
                    username=current_user.username,
                    action="IMPORT",
                    new_data=question_create.dict(),
                    summary=f"Question imported: {question_create.subject} - {question_create.topic}"
                )
                
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Question {i+1}: {str(e)}")
        
        message = f"Successfully imported {imported_count} questions"
        if errors:
            message += f". {len(errors)} errors occurred: {'; '.join(errors[:5])}"
        
        return {"message": message}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")

@app.get("/api/questions/export")
async def export_questions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_editor_or_admin)
):
    questions = crud.get_questions(db, limit=10000)  # Get all questions
    
    export_data = {
        "questions": [
            {
                "subject": q.subject,
                "topic": q.topic,
                "question": q.question,
                "difficulty": q.difficulty.value,
                "attachment": q.attachment_filename
            }
            for q in questions
        ]
    }
    
    return JSONResponse(
        content=export_data,
        headers={"Content-Disposition": "attachment; filename=questions_export.json"}
    )

# Audit log routes
@app.get("/api/questions/{question_id}/audit", response_model=List[schemas.AuditLog])
async def get_question_audit_logs(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_editor_or_admin)
):
    return crud.get_audit_logs(db, question_id=question_id)

@app.get("/api/questions/{question_id}/audit/history")
async def get_question_audit_history(
    question_id: int,
    days_back: int = 30,
    current_user: models.User = Depends(auth.require_editor_or_admin)
):
    """Get detailed audit history from sequential log files"""
    history = get_question_audit_history(question_id, days_back)
    return {"history": history}

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Question Management System is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)