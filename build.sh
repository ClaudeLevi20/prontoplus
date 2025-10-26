#!/bin/bash
set -e

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔧 Generating Prisma Client for API..."
cd apps/api
pnpm exec prisma generate
cd ../..

echo "🏗️  Building all packages..."
pnpm turbo build

echo "✅ Build complete!"
