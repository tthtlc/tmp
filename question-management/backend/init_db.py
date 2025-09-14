#!/usr/bin/env python3
"""
Database initialization script
Creates default admin user and sample data
"""

import asyncio
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import Base, User, Question, UserRole, DifficultyLevel, QuestionStatus
from auth import get_password_hash

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")

def create_default_users():
    """Create default users for testing"""
    db = SessionLocal()
    try:
        print("Creating default users...")
        
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Users already exist, skipping user creation")
            return
        
        # Create admin user
        admin_user = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        
        # Create editor user
        editor_user = User(
            username="editor",
            email="editor@example.com",
            hashed_password=get_password_hash("editor123"),
            role=UserRole.EDITOR,
            is_active=True
        )
        db.add(editor_user)
        
        # Create viewer user
        viewer_user = User(
            username="viewer",
            email="viewer@example.com",
            hashed_password=get_password_hash("viewer123"),
            role=UserRole.VIEWER,
            is_active=True
        )
        db.add(viewer_user)
        
        db.commit()
        print("✓ Default users created:")
        print("  - admin (password: admin123)")
        print("  - editor (password: editor123)")
        print("  - viewer (password: viewer123)")
        
    except Exception as e:
        print(f"Error creating users: {e}")
        db.rollback()
    finally:
        db.close()

def create_sample_questions():
    """Create sample questions for testing"""
    db = SessionLocal()
    try:
        print("Creating sample questions...")
        
        # Check if questions already exist
        if db.query(Question).count() > 0:
            print("Questions already exist, skipping question creation")
            return
        
        # Get admin user ID
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            print("Admin user not found, cannot create sample questions")
            return
        
        sample_questions = [
            {
                "subject": "Mathematics",
                "topic": "Algebra",
                "question": "Solve for $x$: $2x + 5 = 13$",
                "difficulty": DifficultyLevel.EASY,
                "status": QuestionStatus.PROD,
            },
            {
                "subject": "Mathematics",
                "topic": "Calculus",
                "question": "Find the derivative of $f(x) = x^2 + 3x + 2$",
                "difficulty": DifficultyLevel.MEDIUM,
                "status": QuestionStatus.PROD,
            },
            {
                "subject": "Physics",
                "topic": "Mechanics",
                "question": "Calculate the velocity using the equation: $$v = u + at$$ where $u = 10 m/s$, $a = 2 m/s^2$, and $t = 5s$",
                "difficulty": DifficultyLevel.MEDIUM,
                "status": QuestionStatus.PROD,
            },
            {
                "subject": "Physics",
                "topic": "Thermodynamics",
                "question": "Explain the first law of thermodynamics and write its mathematical expression: $$\\Delta U = Q - W$$",
                "difficulty": DifficultyLevel.HARD,
                "status": QuestionStatus.DEVMT,
            },
            {
                "subject": "Chemistry",
                "topic": "Stoichiometry",
                "question": "Balance the chemical equation: $C_2H_6 + O_2 \\rightarrow CO_2 + H_2O$",
                "difficulty": DifficultyLevel.MEDIUM,
                "status": QuestionStatus.PROD,
            },
        ]
        
        for q_data in sample_questions:
            question = Question(
                subject=q_data["subject"],
                topic=q_data["topic"],
                question=q_data["question"],
                difficulty=q_data["difficulty"],
                status=q_data["status"],
                created_by=admin_user.id
            )
            db.add(question)
        
        db.commit()
        print(f"✓ Created {len(sample_questions)} sample questions")
        
    except Exception as e:
        print(f"Error creating sample questions: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main initialization function"""
    print("Initializing Question Management System Database...")
    print("=" * 50)
    
    try:
        create_tables()
        create_default_users()
        create_sample_questions()
        
        print("=" * 50)
        print("✓ Database initialization completed successfully!")
        print("\nYou can now start the application with:")
        print("  python main.py")
        print("\nOr using uvicorn:")
        print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())