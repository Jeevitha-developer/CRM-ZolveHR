#!/bin/bash

echo "🚀 Starting HRMS CRM Backend..."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Navigate to backend
cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found in backend directory"
    echo "Please create a .env file with your database credentials"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Initialize database
echo "🏗️  Initializing database..."
node scripts/init-database.js

# Start the server
echo "🚀 Starting backend server..."
npm start