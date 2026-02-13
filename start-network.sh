#!/bin/bash

echo "========================================"
echo "Starting Servers for Network Access"
echo "========================================"
echo ""

# Find IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

echo "========================================"
echo "Your IP Address: $IP"
echo "========================================"
echo ""
echo "Access your website from other devices:"
echo "Frontend: http://$IP:5173"
echo "Backend:  http://$IP:3000"
echo ""
echo "IMPORTANT: Make sure to update backend/.env:"
echo "CLIENT_URL=http://$IP:5173"
echo ""
echo "========================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

echo "Starting Backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting Frontend with network access..."
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Servers are running!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo "Network:  http://$IP:5173"
echo ""
echo "Press Ctrl+C to stop servers..."
echo ""

# Wait for user to press Ctrl+C
wait
