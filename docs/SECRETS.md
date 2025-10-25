# GitHub Secrets Configuration

This document lists all the secrets and environment variables required for the ProntoPlus CI/CD pipeline.

## Required GitHub Secrets

Add these secrets to your GitHub repository at: **Settings → Secrets and variables → Actions**

### 1. Railway Token

**Secret Name:** `RAILWAY_TOKEN`

**Description:** Railway API token for authentication

**How to Get:**
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your profile → Account Settings
3. Go to "Tokens" tab
4. Click "Create Token"
5. Give it a name (e.g., "ProntoPlus CI/CD")
6. Copy the token value

**Permissions Required:**
- Read/Write access to projects
- Environment management
- Deployment permissions

### 2. Railway API Project ID

**Secret Name:** `RAILWAY_API_PROJECT_ID`

**Description:** Unique identifier for the API Railway project

**How to Get:**
1. Go to your API project in Railway dashboard
2. Click on "Settings" tab
3. Go to "General" section
4. Copy the "Project ID" value

**Example:** `abc123def-456g-789h-ijkl-mnopqrstuvwx`

### 3. Railway Frontend Project ID

**Secret Name:** `RAILWAY_FRONTEND_PROJECT_ID`

**Description:** Unique identifier for the Frontend Railway project

**How to Get:**
1. Go to your Frontend project in Railway dashboard
2. Click on "Settings" tab
3. Go to "General" section
4. Copy the "Project ID" value

**Example:** `xyz789abc-123d-456e-fghi-jklmnopqrstu`

### 4. Codecov Token

**Secret Name:** `CODECOV_TOKEN`

**Description:** Codecov upload token for coverage reporting

**How to Get:**
1. Go to [Codecov.io](https://codecov.io)
2. Sign in with your GitHub account
3. Add your repository
4. Go to Repository Settings → General
5. Copy the "Repository Upload Token"

**Note:** This is optional but recommended for coverage reporting

### 5. Lighthouse CI Token (Optional)

**Secret Name:** `LHCI_GITHUB_APP_TOKEN`

**Description:** GitHub token for Lighthouse CI GitHub App integration

**How to Get:**
1. Go to GitHub → Settings → Developer settings
2. Click "Personal access tokens" → "Tokens (classic)"
3. Click "Generate new token (classic)"
4. Select scopes: `repo`, `workflow`
5. Copy the generated token

**Note:** This is optional and only needed for advanced Lighthouse CI features

## Railway Environment Variables

These should be configured in Railway dashboard, **NOT** as GitHub secrets:

### API Project Environment Variables

Configure these in Railway API project → Variables tab:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Application port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://user:pass@host:6379` |
| `CONFIGCAT_SDK_KEY` | ConfigCat server-side SDK key | `configcat_xxxxxxxxxxxxxxxxxxxx` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key` |
| `API_RATE_LIMIT` | API rate limit | `100` |

### Frontend Project Environment Variables

Configure these in Railway Frontend project → Variables tab:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Application port | `3000` |
| `NEXT_PUBLIC_API_URL` | Public API URL | `https://prontoplus-api.up.railway.app` |
| `NEXT_PUBLIC_CONFIGCAT_SDK_KEY` | ConfigCat client-side SDK key | `configcat_xxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `ProntoPlus` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |

## Environment-Specific Configuration

### Production Environment

All projects should have these base variables:

```bash
NODE_ENV=production
```

### Preview Environment

Preview environments (for PRs) will automatically inherit from production but can be overridden:

```bash
NODE_ENV=development
```

## Security Best Practices

### 1. Secret Management

- ✅ Use GitHub Secrets for CI/CD tokens
- ✅ Use Railway Variables for application config
- ❌ Never commit secrets to repository
- ❌ Never log secrets in CI/CD output

### 2. Token Rotation

- Rotate Railway tokens every 90 days
- Rotate GitHub tokens every 60 days
- Monitor token usage in respective dashboards
- Revoke unused tokens immediately

### 3. Access Control

- Use least-privilege principle
- Create separate tokens for different purposes
- Use Railway team accounts for production
- Limit GitHub token scopes to minimum required

### 4. Monitoring

- Monitor token usage in Railway dashboard
- Check GitHub Actions logs for security issues
- Set up alerts for failed deployments
- Review access logs regularly

## Troubleshooting Secrets

### Common Issues

#### 1. Invalid Railway Token

**Error:** `Authentication failed` or `Invalid token`

**Solution:**
- Verify token is correctly copied (no extra spaces)
- Check token hasn't expired
- Ensure token has required permissions
- Create new token if needed

#### 2. Wrong Project ID

**Error:** `Project not found` or `Access denied`

**Solution:**
- Verify Project ID is correct
- Check token has access to the project
- Ensure project exists and is active
- Try linking project manually: `railway link <PROJECT_ID>`

#### 3. Missing Environment Variables

**Error:** Application fails to start or crashes

**Solution:**
- Check all required variables are set in Railway
- Verify variable names match exactly (case-sensitive)
- Check variable values are valid
- Restart deployment after adding variables

#### 4. Codecov Upload Fails

**Error:** `Codecov upload failed`

**Solution:**
- Verify `CODECOV_TOKEN` is set correctly
- Check repository is added to Codecov
- Ensure token has upload permissions
- This is optional - CI will continue without it

### Verification Commands

Test your secrets configuration:

```bash
# Test Railway authentication
railway login --token $RAILWAY_TOKEN
railway status

# Test project access
railway link $RAILWAY_API_PROJECT_ID
railway status

# Test environment variables
railway variables
```

## Secret Rotation Procedure

### 1. Railway Token Rotation

1. Create new Railway token
2. Update `RAILWAY_TOKEN` in GitHub Secrets
3. Test deployment with new token
4. Revoke old token after successful deployment

### 2. GitHub Token Rotation

1. Generate new GitHub token
2. Update `LHCI_GITHUB_APP_TOKEN` in GitHub Secrets
3. Test Lighthouse CI functionality
4. Revoke old token

### 3. Application Secret Rotation

1. Generate new secrets (JWT, API keys, etc.)
2. Update Railway environment variables
3. Deploy application
4. Update any external services with new secrets

## Emergency Procedures

### If Secrets Are Compromised

1. **Immediately revoke** all compromised tokens
2. **Generate new tokens** with same permissions
3. **Update GitHub Secrets** with new values
4. **Redeploy applications** to use new secrets
5. **Monitor logs** for suspicious activity
6. **Review access logs** for unauthorized usage

### If Deployment Fails

1. Check GitHub Actions logs for specific errors
2. Verify all secrets are correctly set
3. Test Railway authentication manually
4. Check Railway project status
5. Review environment variables in Railway
6. Contact support if issues persist

## Support Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Codecov Token Setup](https://docs.codecov.com/docs/authentication)
- [Lighthouse CI Setup](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)
