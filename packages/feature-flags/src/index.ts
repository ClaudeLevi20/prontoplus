export const FeatureFlags = {
  INSURANCE_VERIFICATION: 'pronto_insurance_verificationboolean',
  OUTBOUND_CALLING: 'pronto_outbound_callingBoolean',
  DEMO_ENABLED: 'pronto_demo_enabledBoolean',
  MAINTENANCE_MODE: 'pronto_maintenance_modeBoolean',
} as const;

export type FeatureFlags = typeof FeatureFlags[keyof typeof FeatureFlags];

export type FeatureFlagValue = boolean;

export interface FeatureFlagStatus {
  flag: string;
  enabled: boolean;
}
