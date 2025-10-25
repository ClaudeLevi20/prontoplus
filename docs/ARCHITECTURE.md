# ProntoPlus Architecture

## Overview

ProntoPlus is a monorepo built with Turborepo, containing a Next.js frontend and NestJS API for an AI receptionist solution targeting orthodontic practices.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **React**: React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Testing**: Jest + React Testing Library

### Backend
- **Framework**: NestJS
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Monorepo
- **Manager**: Turborepo
- **Package Manager**: pnpm workspaces
- **Linting**: ESLint with shared configs
- **Formatting**: Prettier
- **Type Checking**: TypeScript with shared configs

## Architecture Patterns

### Monorepo Structure
```
/
├── apps/           # Applications
├── packages/       # Shared libraries
├── docs/          # Documentation
└── config files   # Root configuration
```

### Shared Packages
- **@prontoplus/ui**: Reusable React components
- **@prontoplus/tsconfig**: TypeScript configurations
- **@prontoplus/eslint-config**: ESLint configurations

### API Design
- **RESTful**: Standard HTTP methods and status codes
- **Modular**: Feature-based module organization
- **Documented**: Swagger/OpenAPI documentation
- **Validated**: Request/response validation with DTOs

### Frontend Design
- **Component-based**: Reusable UI components
- **Type-safe**: Full TypeScript coverage
- **Responsive**: Mobile-first design with Tailwind
- **Accessible**: ARIA-compliant components

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        FE[Next.js Frontend<br/>React 19 + TypeScript]
        UI[Shared UI Components<br/>shadcn/ui + Tailwind]
    end
    
    subgraph "API Layer"
        API[NestJS API<br/>TypeScript + Swagger]
        AUTH[Authentication<br/>JWT + Guards]
        VALID[Validation<br/>DTOs + Pipes]
    end
    
    subgraph "Business Logic"
        USERS[User Service<br/>CRUD Operations]
        PRACTICES[Practice Service<br/>Business Logic]
        HEALTH[Health Service<br/>Monitoring]
        LOGS[Logs Service<br/>Error Tracking]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Primary Database)]
        REDIS[(Redis<br/>Caching Layer)]
        PRISMA[Prisma ORM<br/>Database Client]
    end
    
    subgraph "External Services"
        CONFIGCAT[ConfigCat<br/>Feature Flags]
        RAILWAY[Railway<br/>Deployment Platform]
    end
    
    FE --> API
    UI --> FE
    API --> AUTH
    API --> VALID
    API --> USERS
    API --> PRACTICES
    API --> HEALTH
    API --> LOGS
    USERS --> PRISMA
    PRACTICES --> PRISMA
    HEALTH --> PRISMA
    LOGS --> PRISMA
    PRISMA --> DB
    API --> REDIS
    API --> CONFIGCAT
    API --> RAILWAY
    FE --> RAILWAY
```

## Data Flow

### Request/Response Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Service
    participant D as Database
    participant R as Redis
    
    U->>F: User Interaction
    F->>A: HTTP Request
    A->>A: Validate Request (DTOs)
    A->>A: Authentication Check
    A->>S: Business Logic
    S->>R: Check Cache
    alt Cache Hit
        R-->>S: Return Cached Data
    else Cache Miss
        S->>D: Database Query
        D-->>S: Return Data
        S->>R: Update Cache
    end
    S-->>A: Return Result
    A->>A: Log Request/Response
    A-->>F: HTTP Response
    F->>F: Update UI State
    F-->>U: Display Result
```

### Frontend → API
1. User interaction triggers API call
2. Request validated by DTOs
3. Business logic processed
4. Database operations via Prisma
5. Response returned to frontend

### Shared State
- **UI Components**: Shared via @prontoplus/ui package
- **Type Definitions**: Shared via TypeScript configs
- **Linting Rules**: Shared via ESLint configs

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK "CUID"
        string email UK "Unique email"
        string name "Optional name"
        UserRole role "USER, ADMIN, SUPER_ADMIN"
        datetime createdAt "Auto-generated"
        datetime updatedAt "Auto-updated"
    }
    
    Practice {
        string id PK "CUID"
        string name "Practice name"
        string phoneNumber "Optional phone"
        string email "Optional email"
        string address "Optional address"
        string ownerId FK "References User.id"
        datetime createdAt "Auto-generated"
        datetime updatedAt "Auto-updated"
    }
    
    User ||--o{ Practice : "owns"
    
    User {
        string id "Primary Key"
        string email "Unique identifier"
        string name "Display name"
        string role "User role"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update timestamp"
    }
    
    Practice {
        string id "Primary Key"
        string name "Practice name"
        string phoneNumber "Contact phone"
        string email "Contact email"
        string address "Physical address"
        string ownerId "Foreign key to User"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last update timestamp"
    }
```

### Database Design Principles

- **CUID Primary Keys**: Using CUID for better performance and security
- **Soft Relationships**: Practices reference users but can exist independently
- **Audit Trail**: Created/updated timestamps on all entities
- **Flexible Schema**: Optional fields for gradual data collection
- **Indexing Strategy**: Indexes on foreign keys and frequently queried fields

## Development Workflow

### Local Development
1. `pnpm install` - Install all dependencies
2. `pnpm dev` - Start all services
3. Frontend: http://localhost:3000
4. API: http://localhost:4000
5. API Docs: http://localhost:4000/api/docs

### Build Process
1. `pnpm build` - Build all packages
2. TypeScript compilation
3. Next.js production build
4. NestJS compilation
5. Shared package compilation

### Testing Strategy
- **Unit Tests**: Individual component/function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user flow testing
- **Type Tests**: TypeScript compilation verification

## Deployment Considerations

### Frontend
- Static export capability
- CDN-friendly assets
- Environment-based configuration

### API
- Container-ready
- Database migrations
- Health check endpoints
- Environment-based configuration

### Shared Packages
- Versioned releases
- Backward compatibility
- Dependency management

## Security

### API Security
- Input validation
- CORS configuration
- Environment variable protection
- Database connection security

### Frontend Security
- XSS prevention
- CSRF protection
- Secure API communication
- Environment variable protection

## Performance

### Frontend Performance
- Code splitting
- Image optimization
- Bundle analysis
- Caching strategies

### API Performance
- Database query optimization
- Response caching
- Connection pooling
- Monitoring and logging

## Scalability

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- CDN integration
- Load balancer ready

### Vertical Scaling
- Efficient resource usage
- Memory optimization
- CPU optimization
- Database indexing

## Deployment Architecture

### Production Deployment

```mermaid
graph TB
    subgraph "Railway Platform"
        subgraph "Frontend Service"
            FE[Next.js App<br/>Static + SSR]
            CDN[Railway CDN<br/>Global Distribution]
        end
        
        subgraph "API Service"
            API[NestJS API<br/>Node.js Runtime]
            LB[Load Balancer<br/>Auto-scaling]
        end
        
        subgraph "Database Service"
            DB[(PostgreSQL<br/>Managed Database)]
            BACKUP[(Backup Storage<br/>Point-in-time Recovery)]
        end
        
        subgraph "Cache Service"
            REDIS[(Redis<br/>Managed Cache)]
        end
    end
    
    subgraph "External Services"
        CONFIGCAT[ConfigCat<br/>Feature Flags]
        GITHUB[GitHub<br/>Source Code]
        ACTIONS[GitHub Actions<br/>CI/CD Pipeline]
    end
    
    subgraph "Monitoring"
        HEALTH[Health Checks<br/>Uptime Monitoring]
        LOGS[Structured Logging<br/>Winston + Daily Rotation]
        METRICS[Performance Metrics<br/>Response Times]
    end
    
    CDN --> FE
    FE --> API
    LB --> API
    API --> DB
    API --> REDIS
    API --> CONFIGCAT
    DB --> BACKUP
    ACTIONS --> FE
    ACTIONS --> API
    API --> HEALTH
    API --> LOGS
    API --> METRICS
```

### CI/CD Pipeline

```mermaid
graph LR
    DEV[Developer] --> GIT[Git Push]
    GIT --> TRIGGER[GitHub Actions]
    TRIGGER --> TEST[Run Tests]
    TEST --> LINT[Lint & Type Check]
    LINT --> BUILD[Build Applications]
    BUILD --> DEPLOY[Deploy to Railway]
    DEPLOY --> HEALTH[Health Check]
    HEALTH --> NOTIFY[Notify Team]
    
    subgraph "Quality Gates"
        TEST
        LINT
        BUILD
    end
    
    subgraph "Deployment"
        DEPLOY
        HEALTH
    end
```

## Monitoring

### Application Monitoring
- Health check endpoints
- Error tracking
- Performance metrics
- User analytics

### Infrastructure Monitoring
- Database performance
- API response times
- Error rates
- Resource utilization
