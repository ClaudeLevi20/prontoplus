# Development Guide

This guide covers the complete development workflow for the ProntoPlus project, including local setup, coding standards, testing, and deployment.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Development Workflow](#development-workflow)
- [Code Style and Conventions](#code-style-and-conventions)
- [Git Workflow](#git-workflow)
- [Testing Strategy](#testing-strategy)
- [Debugging](#debugging)
- [Common Development Tasks](#common-development-tasks)
- [Performance Optimization](#performance-optimization)

## Local Development Setup

### Prerequisites

Before starting development, ensure you have:

- **Node.js 20+**: [Download](https://nodejs.org/)
- **pnpm 9+**: `npm install -g pnpm`
- **PostgreSQL 14+**: [Download](https://www.postgresql.org/download/)
- **Redis 6+** (optional): [Download](https://redis.io/download)
- **Git**: [Download](https://git-scm.com/)

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ProntoPlus.git
   cd ProntoPlus
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy environment examples
   cp apps/api/env.example apps/api/.env
   cp apps/frontend/.env.example apps/frontend/.env.local
   
   # Edit with your configuration
   nano apps/api/.env
   nano apps/frontend/.env.local
   ```

4. **Set up the database**:
   ```bash
   # Create PostgreSQL database
   createdb prontoplus_dev
   
   # Run migrations
   cd apps/api
   pnpm prisma:migrate dev
   pnpm prisma:generate
   ```

5. **Start development servers**:
   ```bash
   # From project root
   pnpm dev
   ```

This will start:
- Frontend: http://localhost:3000
- API: http://localhost:4000
- API Documentation: http://localhost:4000/api/docs

### Environment Configuration

#### API Environment (.env)

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/prontoplus_dev"

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

#### Frontend Environment (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Feature Flags
NEXT_PUBLIC_CONFIGCAT_SDK_KEY="your_configcat_client_key"

# Application
NEXT_PUBLIC_APP_NAME="ProntoPlus"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

## Development Workflow

### Daily Development Routine

1. **Start your day**:
   ```bash
   # Pull latest changes
   git pull origin main
   
   # Install any new dependencies
   pnpm install
   
   # Start development servers
   pnpm dev
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Write code following the style guide
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**:
   ```bash
   # Run all tests
   pnpm test
   
   # Run linting
   pnpm lint
   
   # Type check
   pnpm type-check
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

6. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

### Development Commands

#### Root Level Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages and apps
pnpm test             # Run tests for all packages and apps
pnpm lint             # Lint all packages and apps
pnpm type-check       # Type check all packages and apps
pnpm clean            # Clean all build artifacts

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:reset         # Reset database (development only)
```

#### API Commands

```bash
cd apps/api

# Development
pnpm dev              # Start with hot reload
pnpm start:dev        # Standard NestJS dev command
pnpm start:debug      # Start with debugger

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:cov         # Run tests with coverage
pnpm test:e2e         # Run end-to-end tests

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio

# Logging
pnpm logs:error       # View error logs
pnpm logs:combined    # View all logs
pnpm logs:clear       # Clear log files
```

#### Frontend Commands

```bash
cd apps/frontend

# Development
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run Jest tests
pnpm test:watch       # Run tests in watch mode

# Analysis
pnpm build --analyze  # Analyze bundle size
```

## Code Style and Conventions

### TypeScript

- **Strict Mode**: Always enabled
- **No Any**: Avoid `any` type, use proper typing
- **Interfaces**: Use interfaces for object shapes
- **Enums**: Use const enums for better performance
- **JSDoc**: Add JSDoc comments for public APIs

```typescript
/**
 * User service for managing user operations
 * 
 * @example
 * ```typescript
 * const userService = new UserService();
 * const user = await userService.create({ name: 'John', email: 'john@example.com' });
 * ```
 */
export class UserService {
  /**
   * Create a new user
   * 
   * @param userData - User creation data
   * @returns Promise<User> - The created user
   * @throws {ConflictException} When email already exists
   */
  async create(userData: CreateUserDto): Promise<User> {
    // Implementation
  }
}
```

### React/Next.js

- **Functional Components**: Use function components with hooks
- **TypeScript Props**: Always type component props
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Error Boundaries**: Use error boundaries for error handling

```typescript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const handleEdit = useCallback(() => {
    onEdit?.(user);
  }, [user, onEdit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{user.email}</p>
        {onEdit && (
          <Button onClick={handleEdit}>Edit</Button>
        )}
      </CardContent>
    </Card>
  );
}
```

### NestJS

- **Modules**: Organize code into feature modules
- **DTOs**: Use DTOs for request/response validation
- **Guards**: Use guards for authentication/authorization
- **Interceptors**: Use interceptors for cross-cutting concerns
- **Services**: Keep business logic in services

```typescript
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new user with validation
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${createUserDto.email}`);
    
    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
      });
      
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }
}
```

### File Naming Conventions

- **Files**: kebab-case (`user-service.ts`, `user-card.tsx`)
- **Directories**: kebab-case (`user-management/`, `api-client/`)
- **Components**: PascalCase (`UserCard.tsx`, `UserService.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_ATTEMPTS`)

### Import Organization

```typescript
// 1. Node modules
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/client';

// 2. Internal modules (absolute imports)
import { CreateUserDto } from '@/dto/create-user.dto';
import { UserService } from '@/services/user.service';

// 3. Relative imports
import './user.styles.css';
import { validateUser } from '../utils/validation';
```

## Git Workflow

### Branch Naming

- **Features**: `feature/description` (`feature/user-authentication`)
- **Bugfixes**: `fix/description` (`fix/login-validation-error`)
- **Hotfixes**: `hotfix/description` (`hotfix/security-patch`)
- **Chores**: `chore/description` (`chore/update-dependencies`)

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
git commit -m "feat(auth): add JWT token refresh endpoint"
git commit -m "fix(api): resolve database connection timeout"
git commit -m "docs: update API documentation with examples"
git commit -m "test(users): add unit tests for user service"
```

### Pull Request Process

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes and Commit**:
   ```bash
   git add .
   git commit -m "feat: implement new feature"
   ```

3. **Push and Create PR**:
   ```bash
   git push origin feature/new-feature
   ```

4. **PR Requirements**:
   - [ ] All tests pass
   - [ ] Code is linted and formatted
   - [ ] Documentation is updated
   - [ ] PR description explains changes
   - [ ] Screenshots for UI changes

5. **Code Review**:
   - Address reviewer feedback
   - Make additional commits if needed
   - Squash commits before merging

6. **Merge**:
   - Use "Squash and merge" for feature branches
   - Delete feature branch after merge

## Testing Strategy

### Unit Tests

**API Tests**:
```typescript
// users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user', async () => {
    const createUserDto = { name: 'John', email: 'john@example.com' };
    const expectedUser = { id: '1', ...createUserDto };

    jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedUser);

    const result = await service.create(createUserDto);
    expect(result).toEqual(expectedUser);
  });
});
```

**Frontend Tests**:
```typescript
// user-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './user-card';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders user information', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### Integration Tests

**API Integration Tests**:
```typescript
// app.e2e-spec.ts
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('healthy');
      });
  });
});
```

### Test Coverage

- **Minimum Coverage**: 80% for new code
- **Critical Paths**: 95% coverage for authentication, payments, etc.
- **Coverage Reports**: Generated in `coverage/` directory

```bash
# Run tests with coverage
pnpm test:cov

# View coverage report
open coverage/lcov-report/index.html
```

## Debugging

### API Debugging

**Debug Mode**:
```bash
# Start with debugger
pnpm start:debug

# Attach debugger in VS Code
# Add breakpoints and use F5 to start debugging
```

**Logging**:
```typescript
// Use structured logging
this.logger.log('User created', { userId: user.id, email: user.email });
this.logger.error('Database error', error, { query: 'SELECT * FROM users' });
this.logger.warn('Deprecated API used', { endpoint: '/old-endpoint' });
```

**Database Debugging**:
```bash
# View database queries
LOG_LEVEL=debug pnpm dev

# Use Prisma Studio
pnpm prisma:studio
```

### Frontend Debugging

**React DevTools**:
- Install React DevTools browser extension
- Use Profiler for performance debugging
- Use Components tab for state inspection

**Next.js Debugging**:
```bash
# Debug mode
DEBUG=* pnpm dev

# Bundle analysis
pnpm build --analyze
```

**Error Tracking**:
```typescript
// Errors are automatically logged to backend
// Check browser console for development errors
// Check backend logs for production errors
```

### Common Debugging Scenarios

1. **API Not Responding**:
   - Check if server is running on correct port
   - Verify environment variables
   - Check database connection

2. **Frontend Build Errors**:
   - Clear Next.js cache: `rm -rf .next`
   - Check TypeScript errors: `pnpm type-check`
   - Verify all imports are correct

3. **Database Issues**:
   - Check connection string format
   - Verify database is running
   - Run migrations: `pnpm prisma:migrate dev`

## Common Development Tasks

### Adding a New API Endpoint

1. **Create DTO**:
   ```typescript
   // dto/create-item.dto.ts
   export class CreateItemDto {
     @IsString()
     @IsNotEmpty()
     name: string;

     @IsEmail()
     email: string;
   }
   ```

2. **Create Service**:
   ```typescript
   // services/items.service.ts
   @Injectable()
   export class ItemsService {
     async create(createItemDto: CreateItemDto): Promise<Item> {
       return this.prisma.item.create({ data: createItemDto });
     }
   }
   ```

3. **Create Controller**:
   ```typescript
   // controllers/items.controller.ts
   @Controller('items')
   export class ItemsController {
     @Post()
     @ApiOperation({ summary: 'Create item' })
     create(@Body() createItemDto: CreateItemDto) {
       return this.itemsService.create(createItemDto);
     }
   }
   ```

4. **Add to Module**:
   ```typescript
   // items.module.ts
   @Module({
     controllers: [ItemsController],
     providers: [ItemsService],
   })
   export class ItemsModule {}
   ```

### Adding a New Frontend Page

1. **Create Page**:
   ```typescript
   // app/items/page.tsx
   export default function ItemsPage() {
     return (
       <div>
         <h1>Items</h1>
         {/* Page content */}
       </div>
     );
   }
   ```

2. **Add API Client Method**:
   ```typescript
   // lib/api-client.ts
   export const apiClient = {
     items: {
       findAll: () => request<Item[]>('/api/v1/items'),
       create: (data: CreateItemDto) => 
         request<Item>('/api/v1/items', { method: 'POST', body: data }),
     },
   };
   ```

3. **Add Types**:
   ```typescript
   // lib/api-types.ts
   export interface Item {
     id: string;
     name: string;
     email: string;
   }
   ```

### Database Schema Changes

1. **Update Schema**:
   ```prisma
   // prisma/schema.prisma
   model Item {
     id        String   @id @default(cuid())
     name      String
     email     String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **Create Migration**:
   ```bash
   pnpm prisma:migrate dev --name add-items-table
   ```

3. **Update Types**:
   ```bash
   pnpm prisma:generate
   ```

### Adding Feature Flags

1. **Backend Integration**:
   ```typescript
   // services/feature.service.ts
   @Injectable()
   export class FeatureService {
     constructor(private configCat: ConfigCatService) {}

     async isFeatureEnabled(feature: string): Promise<boolean> {
       return this.configCat.getFeatureFlag(feature);
     }
   }
   ```

2. **Frontend Integration**:
   ```typescript
   // hooks/useFeatureFlag.ts
   export function useFeatureFlag(flag: string): boolean {
     return useFeatureFlag(flag);
   }
   ```

## Performance Optimization

### API Performance

- **Database Queries**: Use Prisma query optimization
- **Caching**: Implement Redis caching for expensive operations
- **Pagination**: Use cursor-based pagination for large datasets
- **Connection Pooling**: Configure Prisma connection pooling

### Frontend Performance

- **Code Splitting**: Use dynamic imports for large components
- **Image Optimization**: Use Next.js Image component
- **Bundle Analysis**: Regular bundle size monitoring
- **Lazy Loading**: Implement lazy loading for non-critical components

### Monitoring

- **Health Checks**: Monitor API health endpoints
- **Error Tracking**: Track frontend and backend errors
- **Performance Metrics**: Monitor response times and memory usage
- **User Analytics**: Track feature usage and performance

## Best Practices

### Security

- **Input Validation**: Always validate user input
- **Authentication**: Implement proper authentication
- **Authorization**: Use role-based access control
- **Environment Variables**: Never commit secrets

### Code Quality

- **Type Safety**: Use TypeScript strictly
- **Error Handling**: Implement proper error handling
- **Logging**: Use structured logging
- **Testing**: Write comprehensive tests

### Documentation

- **API Documentation**: Keep Swagger docs updated
- **Code Comments**: Add JSDoc comments for public APIs
- **README Files**: Keep documentation current
- **Architecture Docs**: Document system architecture

This development guide should help you get started and maintain high-quality code throughout the development process. For specific questions or issues, refer to the troubleshooting guide or create an issue in the repository.
