# Question Management System

A comprehensive web application for managing educational questions with LaTeX support, user authentication, and audit logging.

## Features

### Core Functionality
- **Question Management**: Create, edit, delete, and organize questions
- **LaTeX Support**: Full mathematical formula support with live preview
- **File Attachments**: Upload and manage image attachments for questions
- **Import/Export**: JSON-based bulk import and export functionality
- **Search & Filter**: Advanced filtering by subject, topic, difficulty, and status

### User Management & Security
- **Role-Based Access Control**: Three user roles (Admin, Editor, Viewer)
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access to different features

### Question Status Management
- **Production Mode**: Questions available to all users
- **Development Mode**: Questions being edited (visible only to editors/admins)
- **Soft Delete**: Questions are marked as deleted, not permanently removed

### Audit & Logging
- **Change Tracking**: All question modifications are logged
- **Sequential Audit Files**: Daily audit logs with detailed change diffs
- **User Activity**: Track who made what changes and when

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Robust relational database
- **SQLAlchemy**: ORM for database operations
- **JWT**: Authentication tokens
- **Pydantic**: Data validation and serialization

### Frontend
- **React**: Modern JavaScript UI library
- **Material-UI**: Professional component library
- **Monaco Editor**: Code editor for LaTeX content
- **KaTeX**: Mathematical formula rendering
- **React Router**: Client-side routing

## Project Structure

```
question-management/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication logic
│   ├── crud.py              # Database operations
│   ├── database.py          # Database configuration
│   ├── audit_logger.py      # Audit logging system
│   ├── file_handler.py      # File upload handling
│   ├── init_db.py           # Database initialization
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts (auth, etc.)
│   │   ├── services/        # API service functions
│   │   └── main.jsx         # React entry point
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
├── uploads/                 # File upload storage
├── audit-logs/              # Sequential audit log files
└── setup.sh                 # Automated setup script
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Quick Setup
```bash
# Clone or download the project
cd question-management

# Run the automated setup script
./setup.sh
```

### Manual Setup

1. **Database Setup**
```bash
# Create PostgreSQL database
sudo -u postgres createdb question_db
```

2. **Backend Setup**
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py
```

3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend
```bash
# Option 1: Using the script
./start-backend.sh

# Option 2: Manual start
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend
```bash
# Option 1: Using the script
./start-frontend.sh

# Option 2: Manual start
cd frontend
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Default User Accounts

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | admin123 | Admin | Full access to all features |
| editor | editor123 | Editor | Create, edit questions; import/export |
| viewer | viewer123 | Viewer | Read-only access to production questions |

## User Roles & Permissions

### Admin
- Full access to all features
- User management
- View all questions (prod and devmt)
- Import/export questions
- Access audit logs
- Create, edit, delete questions

### Editor
- Create, edit, delete questions
- Import/export questions
- View all questions (prod and devmt)
- Access audit logs
- Cannot manage users

### Viewer
- Read-only access
- Can only view production questions
- Cannot create, edit, or delete questions
- Cannot access admin features

## JSON Import/Export Format

### Import Format
```json
{
  "questions": [
    {
      "subject": "Mathematics",
      "topic": "Algebra",
      "question": "Solve for $x$: $2x + 5 = 13$",
      "difficulty": "easy",
      "attachment": "optional_image.png"
    }
  ]
}
```

### Required Fields
- `subject`: Subject area (string)
- `topic`: Specific topic (string)
- `question`: Question content with LaTeX support (string)
- `difficulty`: "easy", "medium", or "hard"

### Optional Fields
- `attachment`: Image filename (string or null)

## LaTeX Support

### Inline Math
Use single dollar signs: `$x^2 + y^2 = z^2$`

### Block Math
Use double dollar signs:
```
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
```

### Common LaTeX Commands
- Fractions: `\frac{a}{b}`
- Superscript: `x^2`
- Subscript: `x_1`
- Greek letters: `\alpha, \beta, \gamma`
- Integrals: `\int_{a}^{b}`
- Summations: `\sum_{i=1}^{n}`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - List questions (with filters)
- `GET /api/questions/{id}` - Get specific question
- `POST /api/questions` - Create question
- `PUT /api/questions/{id}` - Update question
- `DELETE /api/questions/{id}` - Soft delete question
- `PUT /api/questions/{id}/status` - Update question status

### Import/Export
- `POST /api/questions/import` - Import questions from JSON
- `GET /api/questions/export` - Export questions to JSON

### Files
- `POST /api/upload` - Upload file attachment
- `GET /api/files/{path}` - Serve uploaded files

### Audit
- `GET /api/questions/{id}/audit` - Get question audit logs
- `GET /api/questions/{id}/audit/history` - Get detailed audit history

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/question_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=../uploads
AUDIT_LOG_DIR=../audit-logs
```

## Audit Logging

The system maintains two types of audit logs:

1. **Database Audit Logs**: Stored in the `audit_logs` table
2. **Sequential File Logs**: Daily files with detailed change diffs

### Audit Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "question_id": 123,
  "user_id": 1,
  "username": "admin",
  "action": "UPDATE",
  "summary": "Question updated: Mathematics - Algebra",
  "changes": {
    "difficulty": {
      "old": "easy",
      "new": "medium"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Permission Denied**
   - Check user roles and permissions
   - Ensure JWT token is valid
   - Verify authentication headers

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure valid image formats

4. **LaTeX Rendering Issues**
   - Verify KaTeX CSS is loaded
   - Check LaTeX syntax
   - Ensure proper dollar sign delimiters

### Development

#### Backend Development
```bash
cd backend
source venv/bin/activate

# Run with auto-reload
uvicorn main:app --reload

# Run tests (if implemented)
pytest
```

#### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Check the browser console for frontend errors
4. Review backend logs for server errors