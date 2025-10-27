// API Response Types

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  featureFlags?: Record<string, boolean>;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeResponse {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// Telnyx Call Types
export interface Call {
  id: string;
  phoneNumber?: string;
  callerName?: string;
  callDuration: number;
  recordingUrl?: string;
  transcriptUrl?: string;
  status: CallStatus;
  telnyxCallId: string;
  telnyxCallControlId?: string;
  direction: CallDirection;
  startedAt: string;
  answeredAt?: string;
  endedAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  demoLead?: DemoLead;
}

export interface DemoLead {
  id: string;
  callId: string;
  callerPhone?: string;
  email?: string;
  name?: string;
  practiceName?: string;
  interestLevel?: LeadInterest;
  notes?: string;
  captured: boolean;
  capturedAt?: string;
  followUpSent: boolean;
  
  // Lead Scoring Fields
  leadScore: number;
  leadQuality?: string;
  sentimentScore?: number;
  questionsAsked: string[];
  mentionedPricing: boolean;
  mentionedInsurance: boolean;
  mentionedScheduling: boolean;
  qualificationNotes?: string;
  
  createdAt: string;
  updatedAt: string;
  call?: Call;
}

export type CallStatus = 
  | 'INITIATED'
  | 'RINGING'
  | 'ANSWERED'
  | 'COMPLETED'
  | 'FAILED'
  | 'BUSY'
  | 'NO_ANSWER';

export type CallDirection = 'INBOUND' | 'OUTBOUND';

export type LeadInterest = 'HOT' | 'WARM' | 'COLD' | 'UNQUALIFIED';
