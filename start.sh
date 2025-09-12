#!/bin/bash

# OneST Portal - Quick Start Script
# This script sets up and starts both frontend and backend services

set -e

echo "🚀 OneST Portal - Quick Start"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

echo "   Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install --silent
else
    echo "   Backend dependencies already installed"
fi

echo "   Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install --silent
else
    echo "   Frontend dependencies already installed"
fi

cd ..

# Set up environment files
echo ""
echo "⚙️  Setting up configuration..."

if [ ! -f "backend/.env.local" ]; then
    cp backend/.env.local.example backend/.env.local
    echo "   Created backend/.env.local"
else
    echo "   Backend configuration already exists"
fi

echo ""
echo "🎯 Starting services..."
echo "   Backend will run on: http://localhost:3001"
echo "   Frontend will run on: http://localhost:3000"
echo ""
echo "   Press Ctrl+C to stop both services"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "   Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both services are starting up..."
echo "   Backend API: http://localhost:3001/api/health"
echo "   Frontend App: http://localhost:3000"
echo ""
echo "   Waiting for services to be ready..."

# Wait for services to be ready
sleep 5

echo ""
echo "🎉 OneST Portal is ready!"
echo "   Open http://localhost:3000 in your browser"
echo ""
echo "Services:"
echo "   • UEN Validation: http://localhost:3000/uen-validation"
echo "   • Weather Forecast: http://localhost:3000/weather"
echo "   • API Health: http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID