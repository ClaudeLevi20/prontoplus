# Pronto Demo AI Receptionist Testing System

Automated testing framework for evaluating the Pronto Demo AI receptionist performance.

## Overview

This testing system makes automated test calls to the Pronto Demo AI assistant, analyzes conversations using OpenAI Whisper and GPT-4, and generates comprehensive performance reports.

## Features

- **Automated Test Calls**: Makes calls via Telnyx to the AI assistant
- **Speech Transcription**: Uses OpenAI Whisper to transcribe recordings
- **AI Evaluation**: Uses GPT-4 to evaluate accuracy, naturalness, and professionalism
- **Performance Metrics**: Tracks response times, awkward pauses, hallucinations, and more
- **Comprehensive Reports**: Generates JSON and HTML reports with visualizations
- **Database Tracking**: Stores all test results in PostgreSQL

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Pronto Demo phone number (Telnyx number with AI assistant configured)
PRONTO_DEMO_PHONE_NUMBER=+15551234567

# Telnyx Configuration
TELNYX_API_KEY=KEY_xxxxx
TELNYX_CALL_CONTROL_APP_ID=your_app_id
TELNYX_PHONE_NUMBER=+1234567890

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxx

# Test settings
TEST_CALL_DELAY_SECONDS=45
```

### 2. Database Migration

Generate and run the Prisma migration:

```bash
cd apps/api
pnpm prisma migrate dev
```

### 3. Install Dependencies

```bash
cd apps/api
pnpm install
```

## Usage

### Run All Tests

```bash
pnpm --filter api test:pronto
```

### Run Specific Category

```bash
pnpm --filter api test:pronto:category greeting
```

### Custom Delay Between Calls

```bash
TEST_CALL_DELAY_SECONDS=60 pnpm --filter api test:pronto
```

## Test Scenarios

The system includes 50+ test scenarios across 6 categories:

1. **Greeting Tests** (5 scenarios) - Initial contact scenarios
2. **Information Tests** (15 scenarios) - Treatment information questions
3. **Appointment Tests** (10 scenarios) - Scheduling and booking
4. **Insurance Tests** (8 scenarios) - Pricing and insurance questions
5. **Emergency Tests** (11 scenarios) - Urgent situations and escalations
6. **Edge Cases** (12 scenarios) - Challenging scenarios

## Output

Test results are saved to:
- **Database**: `test_runs` and `test_results` tables
- **Filesystem**: `apps/api/test-results/{testRunId}/`
  - `report.json` - Detailed JSON results
  - `report.html` - Interactive HTML dashboard

## Report Features

- Test summary statistics
- Pass/fail rates
- Quality scores (accuracy, naturalness, professionalism)
- Response time metrics
- Issue tracking (hallucinations, inaccuracies)
- Top recommendations for improvement

## Architecture

```
test-pronto-demo.ts (Main orchestrator)
├── lib/
│   ├── openai-client.ts (Whisper + GPT-4)
│   ├── mcp-helpers.ts (Telnyx integration)
│   └── report-generator.ts (JSON + HTML reports)
└── test-scenarios/
    ├── greeting-tests.json
    ├── information-tests.json
    ├── appointment-tests.json
    ├── insurance-tests.json
    ├── emergency-tests.json
    └── edge-case-tests.json
```

## Development

### Adding New Test Scenarios

Create or edit scenario files in `test-scenarios/`:

```json
{
  "category": "greeting",
  "scenarios": [
    {
      "id": "test-001",
      "name": "Test Name",
      "category": "greeting",
      "questions": ["Question 1"],
      "expectedBehavior": "What AI should do",
      "expectedAnswers": ["Expected answer 1"],
      "expectedDuration": 30
    }
  ]
}
```

### Extending Evaluation

Modify `lib/openai-client.ts` to adjust GPT-4 evaluation prompts or add new metrics.

## Troubleshooting

**No recording available**: Ensure Telnyx Call Control App has recording enabled.

**Call timeout**: Increase `TEST_CALL_DELAY_SECONDS` or check AI assistant configuration.

**API errors**: Verify environment variables are set correctly in `.env`.

## License

Internal ProntoPlus tool.

