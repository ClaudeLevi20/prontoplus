# Contributing to ProntoPlus

Thank you for your interest in contributing to ProntoPlus! This document provides guidelines and information for contributors.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and constructive in all interactions
- Focus on what is best for the community
- Show empathy towards other community members
- Accept constructive criticism gracefully
- Help create a safe environment for everyone

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Git
- A code editor (VS Code recommended)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/ProntoPlus.git
   cd ProntoPlus
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/frontend/.env.example apps/frontend/.env.local
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

5. **Verify setup**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - API Docs: http://localhost:4000/api/docs

## Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Feature development branches
- **bugfix/***: Bug fix branches
- **hotfix/***: Critical production fixes

### Creating a Pull Request

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation as needed
   - Follow the coding standards below

3. **Test your changes**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT authentication
fix(api): resolve database connection issue
docs: update API documentation
```

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use enums for constants
- Add JSDoc comments for public APIs

### React/Next.js

- Use functional components with hooks
- Prefer TypeScript over PropTypes
- Use proper error boundaries
- Follow Next.js best practices
- Use Tailwind CSS for styling

### NestJS

- Follow NestJS conventions
- Use DTOs for request/response validation
- Add comprehensive Swagger documentation
- Use proper error handling
- Follow dependency injection patterns

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic

## Testing

### Frontend Testing

```bash
# Run all frontend tests
pnpm test:frontend

# Run tests in watch mode
pnpm test:frontend:watch

# Run tests with coverage
pnpm test:frontend:coverage
```

**Testing Guidelines:**
- Write unit tests for components
- Test user interactions
- Mock external dependencies
- Aim for >80% code coverage

### Backend Testing

```bash
# Run all API tests
pnpm test:api

# Run tests in watch mode
pnpm test:api:watch

# Run tests with coverage
pnpm test:api:coverage
```

**Testing Guidelines:**
- Write unit tests for services
- Write integration tests for controllers
- Test error scenarios
- Mock external services

## Documentation

### Code Documentation

- Add JSDoc comments to all public functions
- Document complex algorithms
- Include usage examples
- Keep README files updated

### API Documentation

- Use Swagger decorators for all endpoints
- Provide request/response examples
- Document error responses
- Keep API documentation current

### Architecture Documentation

- Update architecture diagrams when making structural changes
- Document new patterns or conventions
- Keep deployment guides current

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

2. **Update documentation** if needed

3. **Add tests** for new functionality

4. **Rebase on latest main**
   ```bash
   git rebase origin/main
   ```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in staging environment
4. **Approval** from at least one maintainer
5. **Merge** to main branch

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Error logs**: Console errors, network errors

### Feature Requests

When requesting features, please include:

- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional context**: Any other relevant information

## Development Guidelines

### Performance

- Optimize database queries
- Use proper caching strategies
- Minimize bundle sizes
- Follow React performance best practices

### Security

- Validate all inputs
- Use proper authentication
- Follow OWASP guidelines
- Keep dependencies updated

### Accessibility

- Use semantic HTML
- Provide proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. Update version numbers
2. Update CHANGELOG.md
3. Run full test suite
4. Create release notes
5. Tag release
6. Deploy to production

## Getting Help

### Resources

- **Documentation**: Check the `/docs` folder
- **API Docs**: http://localhost:4000/api/docs
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions

### Contact

- **Maintainers**: @maintainers
- **Email**: support@prontoplus.com
- **Discord**: [Community Discord](https://discord.gg/prontoplus)

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

Thank you for contributing to ProntoPlus! 🚀