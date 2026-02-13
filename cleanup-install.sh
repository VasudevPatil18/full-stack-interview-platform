#!/bin/bash

echo "========================================"
echo "GetStream Cleanup - Reinstall Dependencies"
echo "========================================"
echo ""

echo "Step 1: Cleaning Backend..."
cd backend
if [ -d "node_modules" ]; then
    echo "Removing backend node_modules..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "Removing backend package-lock.json..."
    rm package-lock.json
fi
echo "Installing backend dependencies..."
npm install
echo "Backend cleanup complete!"
echo ""

echo "Step 2: Cleaning Frontend..."
cd ../frontend
if [ -d "node_modules" ]; then
    echo "Removing frontend node_modules..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "Removing frontend package-lock.json..."
    rm package-lock.json
fi
echo "Installing frontend dependencies..."
npm install
echo "Frontend cleanup complete!"
echo ""

cd ..
echo "========================================"
echo "Cleanup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Remove GetStream variables from your .env files"
echo "2. Start backend: cd backend && npm start"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Test video calls with two browsers"
echo ""
echo "See CLEANUP_COMPLETE.md for full details"
echo ""
