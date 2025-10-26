'use client';

import { FeatureFlags } from '@prontoplus/feature-flags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@prontoplus/ui';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function DemoSection() {
  // Temporarily disable to prevent ConfigCat errors during build
  return null;
  
  // const { value: isDemoEnabled, loading } = useFeatureFlag(FeatureFlags.DEMO_ENABLED);

  // if (loading) {
  //   return (
  //     <Card>
  //       <CardHeader>
  //         <Skeleton className="h-6 w-48" />
  //       </CardHeader>
  //       <CardContent>
  //         <Skeleton className="h-20 w-full" />
  //       </CardContent>
  //     </Card>
  //   );
  // }

  // if (!isDemoEnabled) {
  //   return null;
  // }

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Demo Feature</CardTitle>
          </div>
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Enabled
          </Badge>
        </div>
        <CardDescription>
          This is a demo section that only appears when the <code className="rounded bg-muted px-1 py-0.5 text-xs">pronto_demo_enabled</code> feature flag is enabled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Feature flags allow you to control the visibility and behavior of features
            without deploying new code. This demo showcases real-time feature flag evaluation.
          </p>
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Current Flag Status</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                {FeatureFlags.DEMO_ENABLED}
              </code>
              <Badge variant="default" className="text-xs">Enabled</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
