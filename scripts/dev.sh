#!/bin/bash

# DecisionHub AI - Development Script
# Starts both API and Web servers concurrently

set -e

echo "🚀 Starting DecisionHub AI Development Servers..."
echo ""

# Check if node_modules exists in root
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Start both servers
echo "Starting servers..."
echo "  - API: http://localhost:3000"
echo "  - Web: http://localhost:5173"
echo ""

npm run dev
