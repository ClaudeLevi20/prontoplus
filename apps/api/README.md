# ProntoPlus API

AI-powered receptionist solution for orthodontic practices - Backend API built with NestJS.

## Overview

The ProntoPlus API is a comprehensive backend service that provides:
- User and practice management
- Health monitoring and logging
- Feature flag integration
- Comprehensive error tracking
- Structured logging with Winston
- Database operations with Prisma ORM

## Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Logging**: Winston with daily rotation
- **Documentation**: Swagger/OpenAPI
- **Feature Flags**: ConfigCat
- **Testing**: Jest + Supertest

## Project Structure

```
src/
├── app.module.ts                 # Root application module
├── main.ts                      # Application entry point
├── common/                      # Shared utilities and configurations
│   ├── filters/                 # Global exception filters
│   ├── interceptors/            # Request/response interceptors
│   └── logger/                  # Winston logger configuration
├── config/                      # Environment configuration
├── database/                    # Database service and module
├── cache/                       # Redis cache service
├── config-cat/                  # Feature flags integration
├── health/                      # Health check endpoints
├── modules/                     # Feature modules
│   ├── users/                   # User management
│   ├── practices/               # Practice management
│   ├── logs/                    # Frontend error logging
│   └── demo/                    # Demo endpoints
└── prisma/                      # Database schema and migrations
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- Redis server (optional, for caching)

## Environment Variables

Create a `.env` file in the `apps/api` directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/prontoplus"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
PORT=4000
LOG_LEVEL="debug"

# Feature Flags
CONFIGCAT_SDK_KEY="your_configcat_server_key"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### Environment Variable Descriptions

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | No | `redis://localhost:6379` |
| `NODE_ENV` | Environment (development/production) | No | `development` |
| `PORT` | Server port | No | `4000` |
| `LOG_LEVEL` | Winston log level | No | `debug` |
| `CONFIGCAT_SDK_KEY` | ConfigCat server SDK key | No | - |
| `FRONTEND_URL` | Frontend URL for CORS | No | `http://localhost:3000` |

## Installation

1. **Install dependencies**:
   ```bash
   cd apps/api
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma client
   pnpm prisma:generate
   
   # Run database migrations
   pnpm prisma:migrate
   ```

## Running the Application

### Development

```bash
# Start with hot reload
pnpm dev

# Or use the standard NestJS command
pnpm start:dev
```

The API will be available at `http://localhost:4000`

### Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start:prod
```

## API Documentation

### Swagger Documentation

Once the server is running, visit:
- **Local**: http://localhost:4000/api/docs
- **Production**: https://your-api-url.com/api/docs

The Swagger documentation includes:
- Complete API endpoint documentation
- Request/response schemas
- Authentication requirements
- Example requests and responses

### Health Check

Monitor API health at:
- **Local**: http://localhost:4000/api/v1/health
- **Production**: https://your-api-url.com/api/v1/health

The health endpoint provides:
- Overall system status
- Database connectivity
- Redis connectivity
- Feature flags status
- System metrics (memory, uptime)

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh token

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Practices
- `GET /api/v1/practices` - Get all practices
- `GET /api/v1/practices?ownerId=:id` - Get practices by owner
- `GET /api/v1/practices/:id` - Get practice by ID
- `POST /api/v1/practices` - Create practice
- `PATCH /api/v1/practices/:id` - Update practice
- `DELETE /api/v1/practices/:id` - Delete practice

### Health & Monitoring
- `GET /api/v1/health` - System health check
- `POST /api/v1/logs/frontend` - Log frontend errors
- `GET /api/v1/logs/recent` - Get recent error logs

## Database

### Schema

The API uses Prisma ORM with the following main entities:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  practices Practice[]
}

model Practice {
  id          String   @id @default(cuid())
  name        String
  phoneNumber String?
  email       String?
  address     String?
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  owner       User     @relation(fields: [ownerId], references: [id])
}
```

### Migrations

```bash
# Create a new migration
pnpm prisma:migrate dev --name migration_name

# Reset database (development only)
pnpm prisma:migrate reset

# Deploy migrations (production)
pnpm prisma:migrate deploy
```

### Database Studio

```bash
# Open Prisma Studio
pnpm prisma:studio
```

## Logging

### Winston Configuration

The API uses Winston for structured logging with:

- **Console output**: Colored, formatted logs for development
- **File output**: JSON logs with daily rotation (production only)
- **Log levels**: error, warn, info, debug
- **Automatic rotation**: Daily files with 14-day retention

### Log Files (Production)

- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs/combined-YYYY-MM-DD.log` - All logs

### Log Commands

```bash
# View error logs
pnpm logs:error

# View all logs
pnpm logs:combined

# Clear log files
pnpm logs:clear
```

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov
```

### End-to-End Tests

```bash
# Run e2e tests
pnpm test:e2e
```

### Test Structure

```
test/
├── app.e2e-spec.ts           # End-to-end tests
└── jest-e2e.json            # E2E test configuration

src/
├── **/*.spec.ts             # Unit tests
└── **/*.controller.spec.ts  # Controller tests
```

## Development

### Code Style

The project uses:
- **ESLint**: Code linting with shared configuration
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

### Adding New Features

1. **Create a new module**:
   ```bash
   nest generate module modules/feature-name
   nest generate controller modules/feature-name
   nest generate service modules/feature-name
   ```

2. **Add to app module**:
   ```typescript
   @Module({
     imports: [
       // ... existing imports
       FeatureNameModule,
     ],
   })
   ```

3. **Create DTOs**:
   ```typescript
   // dto/create-feature.dto.ts
   export class CreateFeatureDto {
     @IsString()
     @IsNotEmpty()
     name: string;
   }
   ```

4. **Add Swagger documentation**:
   ```typescript
   @ApiOperation({ summary: 'Create feature' })
   @ApiResponse({ status: 201, description: 'Feature created' })
   ```

## Deployment

### Railway Deployment

The API is configured for automatic deployment on Railway:

1. **Environment Variables**: Set in Railway dashboard
2. **Database**: PostgreSQL addon
3. **Redis**: Redis addon (optional)
4. **Build Command**: `pnpm build`
5. **Start Command**: `pnpm start:prod`

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

## Monitoring

### Health Checks

The API provides comprehensive health monitoring:

- **Database**: Connection and query performance
- **Redis**: Connection and ping response
- **Feature Flags**: ConfigCat service status
- **System**: Memory usage, uptime, Node.js version

### Error Tracking

- **Frontend Errors**: Logged via `/api/v1/logs/frontend`
- **Backend Errors**: Winston logging with structured format
- **Request/Response**: Logged via interceptors

### Performance Monitoring

- **Response Times**: Tracked in health checks
- **Memory Usage**: Monitored in health endpoint
- **Database Queries**: Logged by Prisma

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check `DATABASE_URL` format
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Redis Connection Failed**:
   - Check `REDIS_URL` format
   - Verify Redis server is running
   - API will continue without Redis

3. **Port Already in Use**:
   - Change `PORT` environment variable
   - Kill existing process: `lsof -ti:4000 | xargs kill`

4. **Prisma Client Out of Sync**:
   ```bash
   pnpm prisma:generate
   ```

### Debug Mode

```bash
# Start with debug logging
LOG_LEVEL=debug pnpm dev

# Start with debugger
pnpm start:debug
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Add JSDoc comments for new functions

## License

Private - All rights reserved
