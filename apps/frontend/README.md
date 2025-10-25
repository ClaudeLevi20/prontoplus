# ProntoPlus Frontend

AI-powered receptionist solution for orthodontic practices - Frontend application built with Next.js 15.

## Overview

The ProntoPlus Frontend is a modern web application that provides:
- Interactive health monitoring dashboard
- User and practice management interfaces
- Real-time error tracking and logging
- Feature flag integration
- Responsive design with Tailwind CSS
- Component library with shadcn/ui

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **React**: React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Feature Flags**: ConfigCat React
- **Testing**: Jest + React Testing Library
- **API Client**: Custom API client with type safety

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── health/                # Health dashboard
│   │   └── page.tsx
│   ├── error.tsx              # Error boundary
│   └── loading.tsx            # Loading component
├── components/                 # React components
│   ├── demo/                  # Demo components
│   ├── health/                # Health monitoring components
│   │   ├── service-status-card.tsx
│   │   └── status-indicator.tsx
│   └── layout/                # Layout components
│       ├── footer.tsx
│       └── header.tsx
├── hooks/                     # Custom React hooks
│   └── useFeatureFlag.ts
├── lib/                       # Utility libraries
│   ├── api-client.ts          # API client
│   ├── api-types.ts           # TypeScript types
│   └── error-logger.ts        # Error logging utility
└── types/                     # TypeScript type definitions
    └── jest-dom.d.ts
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Access to ProntoPlus API

## Environment Variables

Create a `.env.local` file in the `apps/frontend` directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Feature Flags
NEXT_PUBLIC_CONFIGCAT_SDK_KEY="your_configcat_client_key"

# Application
NEXT_PUBLIC_APP_NAME="ProntoPlus"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Environment Variable Descriptions

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | - |
| `NEXT_PUBLIC_CONFIGCAT_SDK_KEY` | ConfigCat client SDK key | No | - |
| `NEXT_PUBLIC_APP_NAME` | Application name | No | `ProntoPlus` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | No | `1.0.0` |

## Installation

1. **Install dependencies**:
   ```bash
   cd apps/frontend
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

## Running the Application

### Development

```bash
# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Build Analysis

```bash
# Analyze bundle size
pnpm build --analyze
```

## Features

### Health Dashboard

Interactive monitoring dashboard at `/health` featuring:

- **System Overview**: Overall health status with visual indicators
- **Service Status Cards**: Individual status for Database, Redis, and Feature Flags
- **Auto-refresh**: Updates every 30 seconds
- **Performance Metrics**: Response times, memory usage, uptime
- **System Information**: Environment, version, Node.js details

### Error Handling

- **Error Boundary**: Catches and logs React errors
- **Error Logging**: Sends errors to backend API
- **Development Mode**: Console logging for debugging
- **Production Mode**: Automatic error reporting

### Feature Flags

Integration with ConfigCat for feature management:

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function MyComponent() {
  const isNewFeatureEnabled = useFeatureFlag('new-feature');
  
  return (
    <div>
      {isNewFeatureEnabled && <NewFeatureComponent />}
    </div>
  );
}
```

### API Integration

Type-safe API client with automatic error handling:

```typescript
import { apiClient } from '@/lib/api-client';

// Get health status
const health = await apiClient.health.check();

// Get users
const users = await apiClient.users.findAll();

// Create practice
const practice = await apiClient.practices.create({
  name: 'New Practice',
  ownerId: 'user-id'
});
```

## Component Library

### Using shadcn/ui Components

The project uses shadcn/ui components from the shared `@prontoplus/ui` package:

```typescript
import { Button, Card, Badge } from '@prontoplus/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline">Click me</Button>
        <Badge>Status</Badge>
      </CardContent>
    </Card>
  );
}
```

### Available Components

- **Button**: Various styles and sizes
- **Card**: Container with header, content, footer
- **Badge**: Status indicators
- **Input**: Form inputs
- **Label**: Form labels
- **Dialog**: Modal dialogs
- **Dropdown Menu**: Context menus
- **Skeleton**: Loading placeholders

## Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with:

- **Custom Design System**: Consistent colors, spacing, typography
- **Dark Mode Support**: Automatic theme switching
- **Responsive Design**: Mobile-first approach
- **Component Variants**: Consistent component styling

### CSS Classes

```typescript
// Layout
className="container mx-auto px-4 py-8"

// Typography
className="text-2xl font-bold text-foreground"

// Colors
className="bg-primary text-primary-foreground"

// Spacing
className="space-y-4 p-6"

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Test Structure

```
src/
├── __tests__/                 # Test files
│   └── page.test.tsx
├── components/
│   └── **/*.test.tsx         # Component tests
└── lib/
    └── **/*.test.ts          # Utility tests
```

### Testing Examples

```typescript
import { render, screen } from '@testing-library/react';
import { StatusIndicator } from '@/components/health/status-indicator';

test('renders healthy status indicator', () => {
  render(<StatusIndicator status="healthy" />);
  const indicator = screen.getByTitle('Status: healthy');
  expect(indicator).toHaveClass('bg-green-500');
});
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

# Type check
pnpm type-check
```

### Adding New Pages

1. **Create page file**:
   ```typescript
   // app/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page Content</div>;
   }
   ```

2. **Add navigation**:
   ```typescript
   // components/layout/header.tsx
   <Link href="/new-page">New Page</Link>
   ```

### Adding New Components

1. **Create component**:
   ```typescript
   // components/new-component.tsx
   interface NewComponentProps {
     title: string;
   }
   
   export function NewComponent({ title }: NewComponentProps) {
     return <div>{title}</div>;
   }
   ```

2. **Add to shared UI package** (if reusable):
   ```typescript
   // packages/ui/src/components/new-component.tsx
   ```

### API Integration

1. **Add API types**:
   ```typescript
   // lib/api-types.ts
   export interface NewEntity {
     id: string;
     name: string;
   }
   ```

2. **Add API client methods**:
   ```typescript
   // lib/api-client.ts
   export const apiClient = {
     newEntity: {
       findAll: () => request<NewEntity[]>('/api/v1/new-entity'),
       create: (data: CreateNewEntityDto) => 
         request<NewEntity>('/api/v1/new-entity', { method: 'POST', body: data }),
     },
   };
   ```

## Performance

### Optimization Features

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Static Generation**: Pre-rendered pages where possible

### Performance Monitoring

- **Core Web Vitals**: Lighthouse CI integration
- **Bundle Size**: Automatic monitoring
- **Runtime Performance**: React DevTools integration

## Deployment

### Railway Deployment

The frontend is configured for automatic deployment on Railway:

1. **Environment Variables**: Set in Railway dashboard
2. **Build Command**: `pnpm build`
3. **Start Command**: `pnpm start`
4. **Static Assets**: Automatically optimized

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring

### Error Tracking

- **Frontend Errors**: Automatically logged to backend
- **Network Errors**: API client error handling
- **Performance Issues**: Core Web Vitals monitoring

### Analytics

- **User Interactions**: Feature flag usage
- **Performance Metrics**: Page load times
- **Error Rates**: Frontend error frequency

## Troubleshooting

### Common Issues

1. **API Connection Failed**:
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify API server is running
   - Check CORS configuration

2. **Build Errors**:
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && pnpm install`
   - Check TypeScript errors: `pnpm type-check`

3. **Feature Flags Not Working**:
   - Verify `NEXT_PUBLIC_CONFIGCAT_SDK_KEY`
   - Check ConfigCat dashboard
   - Review browser console for errors

4. **Styling Issues**:
   - Check Tailwind CSS classes
   - Verify component imports
   - Review CSS custom properties

### Debug Mode

```bash
# Start with debug logging
DEBUG=* pnpm dev

# Check bundle analysis
pnpm build --analyze
```

## Contributing

1. Follow the existing code style
2. Add tests for new components
3. Update documentation
4. Ensure all tests pass
5. Use TypeScript for type safety

## License

Private - All rights reserved
