# ProntoPlus

[![CI](https://github.com/your-username/ProntoPlus/workflows/CI/badge.svg)](https://github.com/your-username/ProntoPlus/actions/workflows/ci.yml)
[![API Deployment](https://github.com/your-username/ProntoPlus/workflows/Deploy%20API/badge.svg)](https://github.com/your-username/ProntoPlus/actions/workflows/deploy-api.yml)
[![Frontend Deployment](https://github.com/your-username/ProntoPlus/workflows/Deploy%20Frontend/badge.svg)](https://github.com/your-username/ProntoPlus/actions/workflows/deploy-frontend.yml)
[![codecov](https://codecov.io/gh/your-username/ProntoPlus/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/ProntoPlus)

AI-powered receptionist solution for orthodontic practices with live demo phone integration.

## Architecture

This is a Turborepo monorepo containing:

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS, and shadcn/ui
- **API**: NestJS with TypeScript, Prisma ORM, and PostgreSQL
- **Shared Packages**: UI components, TypeScript configs, and ESLint configs

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (or Neon account)

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp apps/api/env.example apps/api/.env
   # Edit apps/api/.env with your database URL
   ```

3. **Start development servers**:
   ```bash
   pnpm dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - API Documentation: http://localhost:4000/api/docs

## Available Scripts

### Root Level
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Type check all packages and apps
- `pnpm test` - Run tests for all packages and apps
- `pnpm clean` - Clean all build artifacts

### Frontend (`apps/frontend`)
- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run Jest tests

### API (`apps/api`)
- `pnpm dev` - Start NestJS development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run Jest tests
- `pnpm test:e2e` - Run end-to-end tests

## Project Structure

```
/
├── apps/
│   ├── frontend/          # Next.js 15 app
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── components/
│   │   │   └── lib/
│   │   ├── public/
│   │   └── package.json
│   └── api/               # NestJS API
│       ├── src/
│       │   ├── health/    # Health check module
│       │   ├── practices/ # Practice management
│       │   ├── users/     # User management
│       │   └── main.ts
│       ├── prisma/        # Database schema
│       └── package.json
├── packages/
│   ├── ui/                # Shared React components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── package.json
│   ├── tsconfig/          # Shared TypeScript configs
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   ├── nestjs.json
│   │   └── react-library.json
│   └── eslint-config/     # Shared ESLint configs
│       ├── base.js
│       ├── nextjs.js
│       └── nestjs.js
├── docs/                  # Documentation
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── package.json          # Root package.json
```

## Development

### Adding New Packages

1. Create a new directory in `packages/`
2. Add `package.json` with proper workspace references
3. Update `pnpm-workspace.yaml` if needed
4. Add to `turbo.json` pipeline if needed

### Adding New Apps

1. Create a new directory in `apps/`
2. Add `package.json` with proper workspace references
3. Update `turbo.json` pipeline configuration

### Shared Packages

- **@prontoplus/ui**: Shared React components built with shadcn/ui
- **@prontoplus/tsconfig**: Shared TypeScript configurations
- **@prontoplus/eslint-config**: Shared ESLint configurations

## Database

The API uses Prisma ORM with PostgreSQL. To set up the database:

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in `apps/api/.env`
3. Run migrations:
   ```bash
   cd apps/api
   npx prisma migrate dev
   ```

## Testing

Tests are configured with Jest across all packages:

- **Frontend**: React Testing Library with jsdom
- **API**: Jest with Supertest for e2e tests
- **Shared Packages**: Jest with appropriate environments

## Deployment

This project uses Railway for deployment with automated CI/CD pipelines:

- **Production**: Automatically deploys on push to `main` branch
- **Preview**: Creates ephemeral environments for pull requests
- **Monitoring**: Includes Lighthouse CI and coverage reporting

### Quick Links

- [Deployment Guide](docs/DEPLOYMENT.md) - Complete setup instructions
- [Secrets Configuration](docs/SECRETS.md) - Required GitHub secrets
- [Railway Dashboard](https://railway.app/dashboard) - Deployment management

### Live Applications

- **Frontend**: [https://prontoplus-frontend.up.railway.app](https://prontoplus-frontend.up.railway.app)
- **API**: [https://prontoplus-api.up.railway.app](https://prontoplus-api.up.railway.app)
- **API Documentation**: [https://prontoplus-api.up.railway.app/api/docs](https://prontoplus-api.up.railway.app/api/docs)
- **Demo Phone**: Call our AI receptionist at the number displayed on the landing page

### Features

- **AI Receptionist**: 24/7 intelligent call handling with natural conversation
- **Call Analytics**: Real-time monitoring and analytics dashboard
- **Lead Capture**: Automatic lead capture and management
- **Slack Integration**: Instant notifications for new calls and leads
- **Admin Dashboard**: Comprehensive call management and analytics
- **Demo Integration**: Live demo phone number for testing

## Documentation

- **[Development Guide](docs/DEVELOPMENT.md)** - Complete development setup and workflow
- **[API Documentation](apps/api/README.md)** - Backend API setup and usage
- **[Frontend Documentation](apps/frontend/README.md)** - Frontend development guide
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Telnyx Setup Guide](docs/TELNYX_SETUP.md)** - AI Assistant integration setup
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines and code review process

## Monitoring and Logging

### Health Dashboard
- **Local**: http://localhost:3000/health
- **Production**: https://your-frontend-url.com/health

The health dashboard provides real-time monitoring of:
- API status and response times
- Database connectivity
- Redis cache status
- Feature flags service
- System metrics (memory, uptime)

### Logging
- **Structured Logging**: Winston with daily rotation
- **Error Tracking**: Frontend errors logged to backend
- **Request/Response Logging**: Automatic API request logging
- **Log Commands**: `pnpm logs:error`, `pnpm logs:combined`

### API Documentation
- **Swagger UI**: http://localhost:4000/api/docs
- **Health Check**: http://localhost:4000/api/v1/health
- **Error Logging**: POST http://localhost:4000/api/v1/logs/frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `pnpm test && pnpm lint`
5. Submit a pull request
6. Preview environment will be automatically created

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

Private - All rights reserved
