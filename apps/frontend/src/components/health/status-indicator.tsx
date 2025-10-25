import { cn } from '@prontoplus/ui';

interface StatusIndicatorProps {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Visual status indicator component
 * 
 * Displays a colored dot to represent service health status:
 * - Green: Healthy
 * - Red: Unhealthy  
 * - Yellow: Degraded
 * - Gray: Unknown
 */
export function StatusIndicator({ status, size = 'md', className }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const statusClasses = {
    healthy: 'bg-green-500',
    unhealthy: 'bg-red-500',
    degraded: 'bg-yellow-500',
    unknown: 'bg-gray-400',
  };

  return (
    <div
      className={cn(
        'rounded-full',
        sizeClasses[size],
        statusClasses[status],
        className
      )}
      title={`Status: ${status}`}
      aria-label={`Service status: ${status}`}
    />
  );
}
