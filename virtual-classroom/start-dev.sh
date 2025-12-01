#!/bin/bash

# Virtual Classroom Development Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting Virtual Classroom Development Environment..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the virtual-classroom directory"
    exit 1
fi

# Check for --clean flag
if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
    echo "🧹 Cleaning build cache..."
    rm -rf node_modules/.vite
    rm -rf dist
    echo "✅ Cache cleared!"
    echo ""
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo ""
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found"
    echo "Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - please update with your credentials"
    echo ""
fi

# Start backend in background
echo "🔧 Starting backend server on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running!"
else
    echo "⚠️  Backend may not be ready yet, but continuing..."
fi
echo ""

# Start frontend
echo "🎨 Starting frontend server on port 5173..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Virtual Classroom is starting!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo ""
echo "  Demo Login:"
echo "  📧 Email:    tutor@example.com"
echo "  🔑 Password: password"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

npm run dev

# Cleanup on exit
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM
