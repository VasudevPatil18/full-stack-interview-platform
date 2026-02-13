#!/bin/bash

echo "========================================"
echo "ngrok Setup for URL Sharing"
echo "========================================"
echo ""

echo "This script will help you share your website via URL"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "[!] ngrok is not installed"
    echo ""
    echo "Please install ngrok:"
    echo "Mac: brew install ngrok"
    echo "Linux: See https://ngrok.com/download"
    echo ""
    exit 1
fi

echo "[+] ngrok is installed"
echo ""

# Check if auth token is configured
if ! ngrok config check &> /dev/null; then
    echo "[!] ngrok auth token not configured"
    echo ""
    echo "Please configure your auth token:"
    echo "1. Sign up at: https://ngrok.com/signup"
    echo "2. Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

echo "[+] ngrok is configured"
echo ""

echo "========================================"
echo "Starting Services"
echo "========================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID $NGROK_BACKEND_PID $NGROK_FRONTEND_PID 2>/dev/null
    echo "All services stopped."
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

echo "[1/4] Starting Backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..
sleep 5

echo "[2/4] Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
sleep 5

echo "[3/4] Starting ngrok for Backend (Port 3000)..."
ngrok http 3000 > /tmp/ngrok-backend.log &
NGROK_BACKEND_PID=$!
sleep 3

echo "[4/4] Starting ngrok for Frontend (Port 5173)..."
ngrok http 5173 > /tmp/ngrok-frontend.log &
NGROK_FRONTEND_PID=$!
sleep 3

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "IMPORTANT: Follow these steps:"
echo ""
echo "1. Get your ngrok URLs:"
echo "   - Open: http://localhost:4040 (ngrok dashboard)"
echo "   - Or check the ngrok windows for HTTPS URLs"
echo ""
echo "2. Copy the Backend URL (e.g., https://abc123.ngrok.io)"
echo ""
echo "3. Copy the Frontend URL (e.g., https://xyz789.ngrok.io)"
echo ""
echo "4. Update frontend/.env:"
echo "   VITE_API_URL=https://abc123.ngrok.io/api"
echo ""
echo "5. Update backend/.env:"
echo "   CLIENT_URL=https://xyz789.ngrok.io"
echo ""
echo "6. Restart Backend and Frontend servers"
echo "   (Press Ctrl+C, then run this script again)"
echo ""
echo "7. Share your Frontend URL with anyone!"
echo "   They can access it from anywhere in the world."
echo ""
echo "========================================"
echo ""
echo "ngrok Dashboard: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

# Wait for user to press Ctrl+C
wait
