#!/bin/bash

echo "🚀 Starting NT Social Media App..."

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    docker stop mongodb-social 2>/dev/null
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# Check if MongoDB container is running
if ! docker ps | grep -q mongodb-social; then
    echo "📦 Starting MongoDB container..."
    docker run -d --name mongodb-social -p 27017:27017 mongo:latest
    echo "⏳ Waiting for MongoDB to start..."
    sleep 5
fi

# Start backend server in background
echo "🔧 Starting Backend Server (Port 5000)..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend server in background
echo "⚛️  Starting Frontend Server (Port 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 NT Social Media App is starting up!"
echo "📍 Backend API: http://localhost:5000"
echo "🌐 Frontend App: http://localhost:3000"
echo ""
echo "⭐ Enhanced Features Available:"
echo "   ✅ Enhanced Profile Edit with Cover Photos & Social Links"
echo "   ✅ Professional Image Lightbox with Zoom & Download"
echo "   ✅ Advanced Friend System with Suggestions"
echo "   ✅ Notification System with Categories"
echo "   ✅ User Management (Block/Unblock, Close Friends)"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait
