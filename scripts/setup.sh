#!/bin/bash

# DecisionHub AI - Setup Script
# Initial project setup

set -e

echo "🚗 DecisionHub AI - Initial Setup"
echo "================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "  ✓ Node.js $NODE_VERSION"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo "  ✓ Root dependencies installed"
echo ""

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm install --workspaces
echo "  ✓ Workspace dependencies installed"
echo ""

# Build shared package
echo "🔨 Building shared package..."
cd packages/shared && npm run build && cd ../..
echo "  ✓ Shared package built"
echo ""

# Copy .env.example to .env for API
if [ ! -f "packages/api/.env" ]; then
  echo "⚙️  Creating API .env file..."
  cp packages/api/.env.example packages/api/.env
  echo "  ✓ .env created (edit if needed)"
else
  echo "  ℹ️  .env already exists"
fi
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review packages/api/.env (default settings should work)"
echo "  2. Run: npm run dev"
echo "  3. Open http://localhost:5173 in your browser"
echo ""
echo "Happy coding! 🎉"
