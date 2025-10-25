import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as configcat from 'configcat-node';
import { FeatureFlags } from '@prontoplus/feature-flags';

@Injectable()
export class ConfigCatService implements OnModuleInit {
  private client: configcat.IConfigCatClient | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const sdkKey = this.configService.get<string>('CONFIGCAT_SDK_KEY');
    
    if (!sdkKey) {
      console.warn('ConfigCat SDK key not found. Feature flags will be disabled.');
      return;
    }

    this.client = configcat.getClient(sdkKey, configcat.PollingMode.AutoPoll, {
      pollIntervalSeconds: 60, // Update every minute
      logger: configcat.createConsoleLogger(configcat.LogLevel.Info),
    });
  }

  async isFeatureEnabled(flag: string, defaultValue = false): Promise<boolean> {
    if (!this.client) {
      return defaultValue;
    }

    try {
      const value = await this.client.getValueAsync(flag, defaultValue);
      return value;
    } catch (error) {
      console.error(`Error checking feature flag ${flag}:`, error);
      return defaultValue;
    }
  }

  async getAllFeatureFlags(): Promise<Record<string, boolean>> {
    if (!this.client) {
      return {};
    }

    const flags: Record<string, boolean> = {};
    
    try {
      for (const flagKey of Object.values(FeatureFlags)) {
        flags[flagKey] = await this.isFeatureEnabled(flagKey, false);
      }
    } catch (error) {
      console.error('Error fetching all feature flags:', error);
    }

    return flags;
  }
}
