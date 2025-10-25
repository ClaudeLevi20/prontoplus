# Troubleshooting Guide

This guide helps you resolve common issues when developing with ProntoPlus.

## Table of Contents

- [Setup Issues](#setup-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Database Issues](#database-issues)
- [API Issues](#api-issues)
- [Frontend Issues](#frontend-issues)
- [Environment Issues](#environment-issues)
- [Performance Issues](#performance-issues)
- [Debug Commands](#debug-commands)

## Setup Issues

### Node.js Version Issues

**Problem**: `pnpm install` fails with Node.js version errors

**Solution**:
```bash
# Check your Node.js version
node --version

# Should be 18+ for this project
# If not, update Node.js using nvm:
nvm install 20
nvm use 20
```

### pnpm Installation Issues

**Problem**: `pnpm` command not found

**Solution**:
```bash
# Install pnpm globally
npm install -g pnpm

# Or use corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

### Dependency Installation Issues

**Problem**: `pnpm install` fails with peer dependency warnings

**Solution**:
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

## Build Issues

### TypeScript Compilation Errors

**Problem**: TypeScript compilation fails

**Solution**:
```bash
# Check for type errors
pnpm type-check

# Fix common issues:
# 1. Missing type definitions
pnpm add -D @types/package-name

# 2. Import/export issues
# Check file extensions and paths

# 3. Strict mode violations
# Add proper type annotations
```

### Webpack Build Errors

**Problem**: Webpack compilation fails

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev

# Clear all caches
pnpm clean
pnpm install
pnpm build
```

### ESLint Errors

**Problem**: ESLint fails with rule violations

**Solution**:
```bash
# Check linting errors
pnpm lint

# Auto-fix what's possible
pnpm lint:fix

# For specific files
pnpm lint apps/frontend/src/components/MyComponent.tsx
```

## Runtime Issues

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 pnpm dev
```

### Memory Issues

**Problem**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or run with increased memory
node --max-old-space-size=4096 node_modules/.bin/next dev
```

### Module Resolution Issues

**Problem**: `Module not found` errors

**Solution**:
```bash
# Check if package is installed
pnpm list package-name

# Reinstall dependencies
pnpm install

# Check tsconfig paths
# Verify import paths are correct
```

## Database Issues

### Database Connection Failed

**Problem**: `PrismaClientInitializationError`

**Solution**:
```bash
# Check database URL in .env
echo $DATABASE_URL

# Test database connection
pnpm prisma db push

# Reset database
pnpm prisma migrate reset
```

### Migration Issues

**Problem**: Migration conflicts or failures

**Solution**:
```bash
# Check migration status
pnpm prisma migrate status

# Reset migrations
pnpm prisma migrate reset

# Create new migration
pnpm prisma migrate dev --name fix-schema

# Deploy migrations
pnpm prisma migrate deploy
```

### Prisma Client Issues

**Problem**: `PrismaClient` not found or outdated

**Solution**:
```bash
# Regenerate Prisma client
pnpm prisma generate

# Reset Prisma client
rm -rf node_modules/.prisma
pnpm prisma generate
```

## API Issues

### API Server Won't Start

**Problem**: NestJS server fails to start

**Solution**:
```bash
# Check for compilation errors
pnpm build:api

# Check environment variables
cat apps/api/.env

# Check port availability
lsof -i :4000

# Start with debug logging
DEBUG=* pnpm start:dev
```

### CORS Issues

**Problem**: CORS errors in browser console

**Solution**:
```bash
# Check CORS configuration in main.ts
# Ensure frontend URL is in allowed origins
# For development, add http://localhost:3000
```

### Authentication Issues

**Problem**: JWT token validation fails

**Solution**:
```bash
# Check JWT_SECRET in environment
echo $JWT_SECRET

# Verify token format
# Check token expiration
# Ensure proper headers are sent
```

## Frontend Issues

### Next.js Build Issues

**Problem**: `next build` fails

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Check for TypeScript errors
pnpm type-check

# Build with verbose output
pnpm build --debug
```

### Hydration Errors

**Problem**: Hydration mismatch errors

**Solution**:
```bash
# Check for client/server differences
# Use useEffect for client-only code
# Ensure consistent rendering
# Check for conditional rendering issues
```

### Styling Issues

**Problem**: Tailwind CSS not working

**Solution**:
```bash
# Check Tailwind config
cat tailwind.config.js

# Verify CSS imports
# Check for conflicting styles
# Restart development server
```

### Component Import Issues

**Problem**: Cannot import components from @prontoplus/ui

**Solution**:
```bash
# Check package build
pnpm build:packages

# Verify package.json exports
# Check TypeScript path mapping
# Rebuild shared packages
```

## Environment Issues

### Environment Variables Not Loading

**Problem**: `process.env.VARIABLE` is undefined

**Solution**:
```bash
# Check .env file exists and is in correct location
ls -la apps/api/.env
ls -la apps/frontend/.env.local

# Verify variable names (no spaces around =)
# Restart development server
# Check for typos in variable names
```

### Different Behavior in Production

**Problem**: App works locally but not in production

**Solution**:
```bash
# Check environment variables in production
# Verify build process
# Check for missing dependencies
# Review deployment logs
```

## Performance Issues

### Slow Build Times

**Problem**: `pnpm build` takes too long

**Solution**:
```bash
# Use build cache
pnpm build --cache

# Build packages in parallel
pnpm build --parallel

# Check for circular dependencies
pnpm analyze
```

### Slow Development Server

**Problem**: Hot reload is slow

**Solution**:
```bash
# Reduce file watching
# Exclude node_modules from watching
# Use faster file system
# Check for large files in project
```

### Memory Leaks

**Problem**: Development server uses too much memory

**Solution**:
```bash
# Check for memory leaks
node --inspect-brk node_modules/.bin/next dev

# Monitor memory usage
# Check for event listeners not being cleaned up
# Restart development server periodically
```

## Debug Commands

### General Debugging

```bash
# Check all services status
pnpm dev --verbose

# Check logs
pnpm logs:error
pnpm logs:combined

# Health check
curl http://localhost:4000/api/v1/health
```

### Database Debugging

```bash
# Prisma studio (GUI for database)
pnpm prisma studio

# Database logs
pnpm prisma db execute --stdin < query.sql

# Check connection
pnpm prisma db push --preview-feature
```

### API Debugging

```bash
# Start with debug logging
DEBUG=* pnpm start:dev

# Check API documentation
open http://localhost:4000/api/docs

# Test endpoints
curl -X GET http://localhost:4000/api/v1/health
```

### Frontend Debugging

```bash
# Next.js debug mode
DEBUG=* pnpm dev

# Check bundle analysis
pnpm analyze

# Check for unused dependencies
pnpm depcheck
```

### Network Debugging

```bash
# Check if ports are open
netstat -an | grep LISTEN

# Test API connectivity
curl -v http://localhost:4000/api/v1/health

# Check CORS headers
curl -H "Origin: http://localhost:3000" -v http://localhost:4000/api/v1/health
```

## Common Error Messages

### `Cannot find module '@prontoplus/ui'`

**Solution**: Build shared packages first
```bash
pnpm build:packages
```

### `EADDRINUSE: address already in use`

**Solution**: Kill process using the port
```bash
kill -9 $(lsof -ti:PORT_NUMBER)
```

### `PrismaClientInitializationError`

**Solution**: Check database connection and regenerate client
```bash
pnpm prisma generate
pnpm prisma db push
```

### `Module not found: Can't resolve`

**Solution**: Check import paths and install missing dependencies
```bash
pnpm install package-name
```

### `TypeError: Cannot read property of undefined`

**Solution**: Add proper null checks and type guards
```typescript
if (object && object.property) {
  // Safe to access
}
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at console output and log files
2. **Search existing issues**: Check GitHub Issues for similar problems
3. **Create a new issue**: Provide detailed information about your problem
4. **Join the community**: Ask questions in GitHub Discussions

### When Creating an Issue

Please include:

- **Environment**: OS, Node.js version, pnpm version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Error messages**: Full error output
- **Screenshots**: If applicable
- **Logs**: Relevant log output

### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

Remember: Most issues can be resolved by clearing caches, reinstalling dependencies, or checking environment variables! 🚀