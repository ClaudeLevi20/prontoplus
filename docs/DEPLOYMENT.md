# Deployment Guide

This document provides comprehensive instructions for setting up and managing deployments for the ProntoPlus application using Railway.

## Overview

The ProntoPlus application uses a modern CI/CD pipeline with:
- **GitHub Actions** for continuous integration and deployment
- **Railway** for hosting and deployment
- **Nixpacks** for automatic build detection
- **Preview environments** for pull requests
- **Lighthouse CI** for performance monitoring
- **Codecov** for coverage reporting

## Railway Deployment

### Prisma Build Configuration

The API uses npm lifecycle hooks to ensure Prisma client generation happens at the correct time during the build process:

- **postinstall**: Generates Prisma client after `pnpm install`
- **prebuild**: Generates Prisma client before TypeScript compilation

This ensures that:
1. The Prisma client is generated after dependencies are installed
2. TypeScript compilation has access to the generated client
3. The build process works correctly on Railway and other platforms

### Railway Environment Variables

Ensure these environment variables are set in your Railway project:

```bash
DATABASE_URL=postgresql://username:password@hostname:5432/database
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
REDIS_URL=redis://hostname:6379  # Optional
CONFIGCAT_SDK_KEY=your_key  # Optional
```

### Build Process

The Railway build process follows these steps:

1. **Install dependencies**: `pnpm install --frozen-lockfile`
   - This triggers `postinstall` hook which runs `prisma generate`

2. **Build application**: `pnpm turbo run build --filter=api`
   - This triggers `prebuild` hook which runs `prisma generate` again (for safety)
   - Then runs `nest build` to compile TypeScript

3. **Start application**: `cd apps/api && pnpm start:prod`

### Troubleshooting

**Issue**: "Cannot find module '@prisma/client'"

**Solution**: Ensure `postinstall` and `prebuild` scripts are present in `apps/api/package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "prebuild": "prisma generate",
    "build": "nest build"
  }
}
```

**Issue**: TypeScript compilation errors for Prisma types

**Solution**: Check that `prisma` is in `devDependencies` in `apps/api/package.json` and that the DATABASE_URL environment variable is set during the build phase.

## Railway Setup

### 1. Create Railway Projects

1. Go to [Railway](https://railway.app) and sign in
2. Create two new projects:
   - `prontoplus-api` (for the NestJS API)
   - `prontoplus-frontend` (for the Next.js frontend)

### 2. Configure Environment Variables

For each project, add the following environment variables in Railway dashboard:

#### API Project (`prontoplus-api`)
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CONFIGCAT_SDK_KEY=your_configcat_key
```

#### Frontend Project (`prontoplus-frontend`)
```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://your-api-url.up.railway.app
NEXT_PUBLIC_CONFIGCAT_SDK_KEY=your_public_configcat_key
```

### 3. Get Project IDs

1. In each Railway project, go to Settings → General
2. Copy the Project ID (you'll need this for GitHub secrets)

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RAILWAY_TOKEN` | Railway API token | Railway Dashboard → Account → Tokens → Create Token |
| `RAILWAY_API_PROJECT_ID` | API project ID | Railway API project → Settings → General → Project ID |
| `RAILWAY_FRONTEND_PROJECT_ID` | Frontend project ID | Railway Frontend project → Settings → General → Project ID |
| `CODECOV_TOKEN` | Codecov upload token | Codecov.io → Repository → Settings → General → Repository Upload Token |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI token (optional) | GitHub → Settings → Developer settings → Personal access tokens |

### Environment Variables for Railway

These should be configured in Railway dashboard, not as GitHub secrets:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string  
- `CONFIGCAT_SDK_KEY` - ConfigCat server-side SDK key
- `NEXT_PUBLIC_CONFIGCAT_SDK_KEY` - ConfigCat client-side SDK key
- `NEXT_PUBLIC_API_URL` - Public API URL for frontend

## Branch Protection Rules

Configure branch protection for the `main` branch:

1. Go to GitHub repository → Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require status checks: `lint`, `type-check`, `test`, `build`
   - ❌ Require pull request reviews (optional)

## Deployment Workflows

### Automatic Deployments

- **Main Branch**: Pushes to `main` trigger automatic deployments
- **API**: Deploys when changes are made to `apps/api/**` or shared packages
- **Frontend**: Deploys when changes are made to `apps/frontend/**` or shared packages

### Preview Environments

- **Pull Requests**: Automatically creates preview environments
- **URLs**: Commented on PR with preview links
- **Cleanup**: Automatically deleted when PR is closed/merged

## Manual Deployment

### Using Railway CLI

1. Install Railway CLI:
   ```bash
   curl -fsSL https://railway.app/install.sh | sh
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link <PROJECT_ID>
   ```

4. Deploy:
   ```bash
   railway up
   ```

### Using GitHub Actions

Trigger manual deployment via GitHub Actions:

1. Go to Actions tab in GitHub
2. Select "Deploy API" or "Deploy Frontend" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Monitoring and Debugging

### Railway Dashboard

- **Deployments**: View deployment history and logs
- **Metrics**: Monitor CPU, memory, and network usage
- **Logs**: Real-time application logs
- **Environment**: Manage environment variables

### GitHub Actions

- **Workflows**: View CI/CD pipeline status
- **Logs**: Detailed logs for each job
- **Artifacts**: Download build artifacts and reports

### Health Checks

- **API Health**: `https://your-api-url.up.railway.app/health`
- **API Docs**: `https://your-api-url.up.railway.app/api/docs`
- **Frontend**: `https://your-frontend-url.up.railway.app`

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Build fails during deployment
**Solution**: 
- Check Railway build logs
- Verify all dependencies are in `package.json`
- Ensure build commands work locally

#### 2. Environment Variables

**Problem**: App fails to start due to missing env vars
**Solution**:
- Verify all required environment variables are set in Railway
- Check variable names match exactly (case-sensitive)
- Restart deployment after adding new variables

#### 3. Database Connection

**Problem**: API can't connect to database
**Solution**:
- Verify `DATABASE_URL` is correctly formatted
- Check database is accessible from Railway
- Ensure Prisma migrations are up to date

#### 4. Preview Environment Issues

**Problem**: Preview environment not created
**Solution**:
- Check GitHub Actions logs for PR preview workflow
- Verify Railway token has sufficient permissions
- Ensure project IDs are correct

### Debug Commands

```bash
# Check Railway status
railway status

# View logs
railway logs

# Check environment variables
railway variables

# Run local development
pnpm dev

# Test build locally
pnpm build
```

### Performance Monitoring

#### Lighthouse CI

Lighthouse CI runs automatically on frontend deployments and checks:
- Performance score (target: >90)
- Accessibility score (target: >90)
- Best practices score (target: >90)
- SEO score (target: >90)

#### Coverage Reports

Codecov integration provides:
- Coverage reports for each PR
- Coverage trends over time
- Coverage comparison between branches

## Security Considerations

### Environment Variables

- Never commit sensitive data to repository
- Use Railway's secure environment variable storage
- Rotate tokens regularly
- Use different tokens for different environments

### Railway Security

- Enable Railway's security features
- Monitor deployment logs for suspicious activity
- Use Railway's built-in SSL certificates
- Configure proper CORS settings

### GitHub Security

- Use GitHub's dependency scanning
- Enable Dependabot for security updates
- Review and approve security alerts
- Use branch protection rules

## Scaling and Performance

### Railway Scaling

- Railway automatically scales based on traffic
- Monitor usage in Railway dashboard
- Consider upgrading plan for high-traffic applications
- Use Railway's built-in CDN for static assets

### Performance Optimization

- Enable Next.js optimizations
- Use Railway's edge caching
- Monitor Lighthouse scores
- Optimize database queries
- Use Redis for caching

## Backup and Recovery

### Database Backups

- Railway provides automatic database backups
- Configure backup retention policies
- Test restore procedures regularly
- Consider additional backup solutions for critical data

### Code Backups

- GitHub provides repository backup
- Use GitHub's branch protection
- Tag releases for easy rollback
- Document deployment procedures

## Support and Resources

### Documentation

- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Deployment](https://docs.nestjs.com/recipes/deployment)

### Community

- [Railway Discord](https://discord.gg/railway)
- [GitHub Community](https://github.community/)
- [Next.js Discord](https://discord.gg/nextjs)
- [NestJS Discord](https://discord.gg/nestjs)

### Getting Help

1. Check this documentation first
2. Review Railway and GitHub logs
3. Search existing issues in repository
4. Create new issue with detailed information
5. Contact support if needed
