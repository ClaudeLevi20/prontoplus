import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as configcat from 'configcat-node';

// Feature flag constants
const FEATURE_FLAGS = {
  INSURANCE_VERIFICATION: 'pronto_insurance_verificationboolean',
  OUTBOUND_CALLING: 'pronto_outbound_callingBoolean',
  DEMO_ENABLED: 'pronto_demo_enabledBoolean',
  MAINTENANCE_MODE: 'pronto_maintenance_modeBoolean',
} as const;

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
      for (const flagKey of Object.values(FEATURE_FLAGS)) {
        flags[flagKey] = await this.isFeatureEnabled(flagKey, false);
      }
    } catch (error) {
      console.error('Error fetching all feature flags:', error);
    }

    return flags;
  }
}
