export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/prontoplus',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  api: {
    prefix: 'api/v1',
    version: '1.0.0',
  },
  telnyx: {
    apiKey: process.env.TELNYX_API_KEY,
    apiV2Key: process.env.TELNYX_API_V2_KEY,
    phoneNumber: process.env.TELNYX_PHONE_NUMBER,
    webhookSecret: process.env.TELNYX_WEBHOOK_SECRET,
    demoPhoneNumber: process.env.NEXT_PUBLIC_DEMO_PHONE_NUMBER,
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
  },
});
