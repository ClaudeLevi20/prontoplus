'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Skeleton } from '@prontoplus/ui';
import { apiClient, ApiError } from '@/lib/api-client';
import type { HealthCheckResponse } from '@/lib/api-types';
import { XCircle, RefreshCw, Clock, Flag } from 'lucide-react';
import { Button } from '@prontoplus/ui';
import { StatusIndicator } from '@/components/health/status-indicator';

export default function HealthPage() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.health.check();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API Error: ${err.message}`);
      } else {
        setError('Failed to fetch health status');
      }
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchHealth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="container px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">API Health Check</h1>
          <p className="text-lg text-muted-foreground">
            Monitor the status and health of the ProntoPlus API
          </p>
        </div>

        <div className="space-y-6">
          {/* Main Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Health Overview</CardTitle>
                  <CardDescription>Current status of all ProntoPlus services</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchHealth}
                  disabled={loading}
                  aria-label="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading && !health ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-64" />
                </div>
              ) : error ? (
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-destructive/10 p-2">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold text-destructive">System Unavailable</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              ) : health ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIndicator 
                        status={health.status === 'ok' ? 'healthy' : 'unhealthy'} 
                        size="lg" 
                      />
                      <div>
                        <p className="font-semibold">
                          {health.status === 'ok' ? 'All Systems Operational' : 'System Issues Detected'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {health.status === 'ok' ? 'All services running smoothly' : 'Critical services are down'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={health.status === 'ok' ? 'default' : 'destructive'}>
                      {health.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Status: {health.status}</span>
                    </div>
                    {lastChecked && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Feature Flags Status */}
          {health && health.featureFlags && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-purple-500" />
                    Feature Flags
                  </CardTitle>
                  <CardDescription>ConfigCat feature flag service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(health.featureFlags).map(([flag, enabled]) => (
                      <div key={flag} className="flex items-center justify-between">
                        <span className="text-sm">{flag}</span>
                        <Badge variant={enabled ? 'default' : 'secondary'}>
                          {enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Information */}
          {health && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>API environment and version details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Environment</span>
                    <span className="font-medium">{health.environment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Version</span>
                    <span className="font-medium">{health.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={health.status === 'ok' ? 'default' : 'destructive'}>
                      {health.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>System performance and uptime</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Service</span>
                    <span className="font-medium">ProntoPlus API</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Check</span>
                    <span className="font-mono text-sm">
                      {lastChecked?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Feature Flags</span>
                    <span className="font-medium">
                      {health.featureFlags ? Object.keys(health.featureFlags).length : 0} configured
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}


          {/* Footer Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground">
                Health checks are automatically performed every 30 seconds
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
