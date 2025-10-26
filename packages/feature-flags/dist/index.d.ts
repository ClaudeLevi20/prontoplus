export declare const FeatureFlags: {
    readonly INSURANCE_VERIFICATION: "pronto_insurance_verificationboolean";
    readonly OUTBOUND_CALLING: "pronto_outbound_callingBoolean";
    readonly DEMO_ENABLED: "pronto_demo_enabledBoolean";
    readonly MAINTENANCE_MODE: "pronto_maintenance_modeBoolean";
};
export type FeatureFlags = typeof FeatureFlags[keyof typeof FeatureFlags];
export type FeatureFlagValue = boolean;
export interface FeatureFlagStatus {
    flag: string;
    enabled: boolean;
}
//# sourceMappingURL=index.d.ts.map