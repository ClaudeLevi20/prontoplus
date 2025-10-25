import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@prontoplus/ui';
import { StatusIndicator } from './status-indicator';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  responseTime?: string;
  details?: Record<string, any>;
}

interface ServiceStatusCardProps {
  serviceName: string;
  serviceDescription: string;
  health: ServiceHealth;
  icon?: React.ReactNode;
}

/**
 * Service status card component
 * 
 * Displays the health status of an individual service with:
 * - Visual status indicator
 * - Service name and description
 * - Status message and response time
 * - Additional details if available
 */
export function ServiceStatusCard({ 
  serviceName, 
  serviceDescription, 
  health, 
  icon 
}: ServiceStatusCardProps) {
  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (health.status) {
      case 'healthy':
        return 'default' as const;
      case 'unhealthy':
        return 'destructive' as const;
      case 'degraded':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-lg">{serviceName}</CardTitle>
              <CardDescription>{serviceDescription}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status={health.status} />
            <Badge variant={getStatusBadgeVariant()}>
              {health.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">{health.message}</span>
          </div>
          
          {health.responseTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Response time: {health.responseTime}</span>
            </div>
          )}

          {health.details && Object.keys(health.details).length > 0 && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <h4 className="mb-2 text-sm font-medium">Details</h4>
              <div className="space-y-1">
                {Object.entries(health.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-mono">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
