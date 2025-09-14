#!/bin/bash

# Question Management System Setup Script

echo "Setting up Question Management System..."
echo "========================================"

# Check if PostgreSQL is running
echo "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Create database
echo "Creating database..."
sudo -u postgres createdb question_db 2>/dev/null || echo "Database might already exist"

# Setup backend
echo "Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Initialize database
echo "Initializing database..."
python init_db.py

cd ..

# Setup frontend
echo "Setting up frontend..."
cd frontend

# Install Node.js dependencies
if command -v npm &> /dev/null; then
    npm install
else
    echo "npm not found. Please install Node.js and npm first."
    exit 1
fi

cd ..

echo "========================================"
echo "Setup completed successfully!"
echo ""
echo "To start the system:"
echo "1. Start the backend:"
echo "   cd backend && source venv/bin/activate && python main.py"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open your browser and go to http://localhost:3000"
echo ""
echo "Default login credentials:"
echo "- Admin: admin / admin123"
echo "- Editor: editor / editor123"
echo "- Viewer: viewer / viewer123"