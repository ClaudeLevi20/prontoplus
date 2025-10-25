'use client';

import { useEffect } from 'react';
import { Button } from '@prontoplus/ui';
import { AlertCircle } from 'lucide-react';
import { errorLogger } from '@/lib/error-logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error using our error logging utility
    errorLogger.logError(error, {
      context: {
        component: 'ErrorBoundary',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      digest: error.digest,
      level: 'error',
    });
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center px-4">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold">Something went wrong!</h1>
        
        <p className="mb-6 text-lg text-muted-foreground">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {error.digest && (
          <p className="mb-6 text-sm text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={reset} size="lg">
            Try Again
          </Button>
          
          <Button onClick={() => (window.location.href = '/')} variant="outline" size="lg">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
