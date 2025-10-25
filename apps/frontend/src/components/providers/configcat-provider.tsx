'use client';

import { ConfigCatProvider as Provider } from 'configcat-react';

export function ConfigCatProvider({ children }: { children: React.ReactNode }) {
  const sdkKey = process.env.NEXT_PUBLIC_CONFIGCAT_SDK_KEY || '';

  if (!sdkKey) {
    console.warn('ConfigCat SDK key not found. Feature flags will be disabled.');
    return <>{children}</>;
  }

  return (
    <Provider
      sdkKey={sdkKey}
      options={{
        pollIntervalSeconds: 60,
      }}
    >
      {children}
    </Provider>
  );
}
