#!/bin/bash
set -e

echo "📦 Installing dependencies..."
# Dependencies already installed by nixpacks

echo "🔧 Generating Prisma Client for API..."
cd apps/api
npx prisma generate
cd ../..

echo "🏗️  Building all packages..."
npx turbo build

echo "✅ Build complete!"
