#!/usr/bin/env ts-node

/**
 * Pronto Demo AI Receptionist Test Runner
 * 
 * Automated testing system for the Pronto Demo AI receptionist
 * Makes test calls via Telnyx, transcribes with Whisper, evaluates with GPT-4,
 * and generates comprehensive performance reports.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { OpenAIClient } from './lib/openai-client';
import { TelnyxHelper } from './lib/mcp-helpers';
import { ReportGenerator, TestResult as ReportTestResult } from './lib/report-generator';

interface Scenario {
  id: string;
  name: string;
  category: string;
  questions: string[];
  expectedBehavior: string;
  expectedAnswers: string[];
  expectedDuration: number;
}

interface CallMetrics {
  scenarioId: string;
  scenarioName: string;
  category: string;
  
  // Timing
  startTime: Date;
  endTime: Date;
  duration: number;
  
  // Performance
  initialResponseTime?: number;
  avgResponseTime?: number;
  maxResponseTime?: number;
  awkwardPauses: number;
  
  // Quality
  correctAnswers: number;
  incorrectAnswers: number;
  hallucinations: string[];
  inaccuracies: string[];
  naturalness: number;
  professionalism: number;
  accuracy: number;
  
  // Issues
  interruptions: number;
  errors: string[];
  
  // Data
  fullTranscript: string;
  aiResponses: string[];
  userQueries: string[];
  recordingUrl: string;
  twilioCallSid: string;
  telnyxCallId?: string;
}

interface TestConfig {
  prontoPhoneNumber: string;
  telnyxApiKey: string;
  openaiApiKey: string;
  telnyxCallControlAppId: string;
  fromNumber: string;
  callDelaySeconds: number;
  scenarioFiles: string[];
}

class TestRunner {
  private prisma: PrismaClient;
  private openaiClient: OpenAIClient;
  private telnyxHelper: TelnyxHelper;
  private reportGenerator: ReportGenerator;
  private config: TestConfig;

  constructor(config: TestConfig) {
    this.config = config;
    this.prisma = new PrismaClient();
    this.openaiClient = new OpenAIClient(config.openaiApiKey);
    this.telnyxHelper = new TelnyxHelper(config.telnyxApiKey);
  }

  /**
   * Main test execution
   */
  async runTests(testCategory?: string): Promise<void> {
    console.log('🚀 Starting Pronto Demo AI Receptionist Tests');
    console.log(`📞 Test Number: ${this.config.prontoPhoneNumber}`);
    console.log(`⏱️  Delay between calls: ${this.config.callDelaySeconds}s\n`);

    // Load test scenarios
    const scenarios = await this.loadTestScenarios(testCategory);
    console.log(`📋 Loaded ${scenarios.length} test scenarios\n`);

    // Create test run in database
    const testRun = await this.prisma.testRun.create({
      data: {
        name: `Test Run - ${new Date().toISOString()}`,
        scenariosTotal: scenarios.length,
        scenariosRun: 0,
        status: 'RUNNING',
      },
    });

    // Setup output directory
    const outputDir = path.join(process.cwd(), 'test-results', testRun.id);
    fs.mkdirSync(outputDir, { recursive: true });
    this.reportGenerator = new ReportGenerator(outputDir);

    console.log(`📁 Results will be saved to: ${outputDir}\n`);

    const results: CallMetrics[] = [];

    // Run each scenario
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`\n[${i + 1}/${scenarios.length}] Running: ${scenario.name}`);
      console.log(`Category: ${scenario.category}`);
      
      try {
        const metrics = await this.executeScenario(scenario);
        results.push(metrics);
        
        // Save result to database
        await this.prisma.testResult.create({
          data: {
            testRunId: testRun.id,
            scenarioId: metrics.scenarioId,
            scenarioName: metrics.scenarioName,
            category: metrics.category,
            callDuration: metrics.duration,
            initialResponseTime: metrics.initialResponseTime,
            avgResponseTime: metrics.avgResponseTime,
            maxResponseTime: metrics.maxResponseTime,
            awkwardPauses: metrics.awkwardPauses,
            accuracy: metrics.accuracy,
            naturalness: metrics.naturalness,
            professionalism: metrics.professionalism,
            correctAnswers: metrics.correctAnswers,
            incorrectAnswers: metrics.incorrectAnswers,
            hallucinations: metrics.hallucinations,
            inaccuracies: metrics.inaccuracies,
            errors: metrics.errors,
            interruptions: metrics.interruptions,
            transcriptText: metrics.fullTranscript,
            recordingUrl: metrics.recordingUrl,
            twilioCallSid: metrics.twilioCallSid,
            telnyxCallId: metrics.telnyxCallId,
            passed: metrics.accuracy >= 3 && metrics.naturalness >= 3 && metrics.professionalism >= 3,
            aiEvaluation: {
              accuracy: metrics.accuracy,
              naturalness: metrics.naturalness,
              professionalism: metrics.professionalism,
            },
            recommendations: [],
          },
        });

        // Update test run progress
        await this.prisma.testRun.update({
          where: { id: testRun.id },
          data: { scenariosRun: i + 1 },
        });

        console.log(`✅ Completed: ${scenario.name} (${metrics.duration}s)`);
        
        // Delay between calls
        if (i < scenarios.length - 1) {
          console.log(`⏳ Waiting ${this.config.callDelaySeconds}s before next test...\n`);
          await this.delay(this.config.callDelaySeconds * 1000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed: ${scenario.name} - ${errorMessage}`);
        results.push({
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          category: scenario.category,
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          awkwardPauses: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          hallucinations: [],
          inaccuracies: [],
          naturalness: 0,
          professionalism: 0,
          accuracy: 0,
          interruptions: 0,
          errors: [errorMessage],
          fullTranscript: '',
          aiResponses: [],
          userQueries: [],
          recordingUrl: '',
          twilioCallSid: '',
        });
      }
    }

    // Generate top recommendations
    console.log('\n📊 Generating recommendations...');
    const topRecommendations = await this.openaiClient.generateRecommendations(results);

    // Generate reports
    console.log('\n📄 Generating reports...');
    const reportResults: ReportTestResult[] = results.map(r => ({
      scenarioId: r.scenarioId,
      scenarioName: r.scenarioName,
      category: r.category,
      passed: r.accuracy >= 3 && r.naturalness >= 3 && r.professionalism >= 3,
      accuracy: r.accuracy,
      naturalness: r.naturalness,
      professionalism: r.professionalism,
      callDuration: r.duration,
      initialResponseTime: r.initialResponseTime,
      avgResponseTime: r.avgResponseTime,
      maxResponseTime: r.maxResponseTime,
      awkwardPauses: r.awkwardPauses,
      hallucinations: r.hallucinations,
      inaccuracies: r.inaccuracies,
      errors: r.errors,
      recommendations: [],
    }));

    this.reportGenerator.generateJSONReport(testRun.id, reportResults);
    this.reportGenerator.generateHTMLReport(testRun.id, reportResults, topRecommendations);

    // Update test run as completed
    const summary = {
      totalScenarios: scenarios.length,
      passedScenarios: reportResults.filter(r => r.passed).length,
      avgAccuracy: reportResults.reduce((sum, r) => sum + r.accuracy, 0) / reportResults.length,
      avgNaturalness: reportResults.reduce((sum, r) => sum + r.naturalness, 0) / reportResults.length,
      avgProfessionalism: reportResults.reduce((sum, r) => sum + r.professionalism, 0) / reportResults.length,
    };

    await this.prisma.testRun.update({
      where: { id: testRun.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        summary,
      },
    });

    console.log(`\n✅ Test run completed!`);
    console.log(`📊 Summary: ${summary.passedScenarios}/${scenarios.length} tests passed`);
    console.log(`📁 Reports saved to: ${outputDir}`);
  }

  /**
   * Execute a single test scenario
   */
  private async executeScenario(scenario: Scenario): Promise<CallMetrics> {
    const startTime = new Date();

    // Start the call
    const callResult = await this.telnyxHelper.startCall(
      this.config.prontoPhoneNumber,
      this.config.fromNumber,
      this.config.telnyxCallControlAppId
    );

    // For test calls, we'll let the AI assistant handle the conversation
    // In a real implementation, we would need to inject questions via TTS
    // For now, we'll wait for the call to complete

    // Wait for call to complete
    console.log('  ⏳ Waiting for call to complete...');
    const completed = await this.telnyxHelper.waitForCallCompletion(callResult.callId, 120);

    if (!completed) {
      throw new Error('Call did not complete within timeout');
    }

    // Get call details
    const callDetails = await this.telnyxHelper.getCallDetails(callResult.callId);
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    let metrics: CallMetrics = {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      category: scenario.category,
      startTime,
      endTime,
      duration,
      awkwardPauses: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      hallucinations: [],
      inaccuracies: [],
      naturalness: 0,
      professionalism: 0,
      accuracy: 0,
      interruptions: 0,
      errors: [],
      fullTranscript: '',
      aiResponses: [],
      userQueries: [],
      recordingUrl: callDetails.recordingUrl || '',
      twilioCallSid: '',
      telnyxCallId: callResult.telnyxCallId,
    };

    // Transcribe if recording is available
    if (callDetails.recordingUrl) {
      console.log('  🎤 Transcribing recording...');
      try {
        const transcription = await this.openaiClient.transcribeRecording(callDetails.recordingUrl);
        metrics.fullTranscript = transcription.fullText;
        metrics.aiResponses = transcription.segments.map(s => s.text);
        metrics.userQueries = []; // Would need to identify user vs AI segments

        // Calculate response times from transcription
        if (transcription.segments.length > 0) {
          metrics.initialResponseTime = transcription.segments[0].start * 1000;
          
          // Analyze for awkward pauses
          for (let i = 1; i < transcription.segments.length; i++) {
            const gap = transcription.segments[i].start - transcription.segments[i - 1].end;
            if (gap > 5) {
              metrics.awkwardPauses++;
            }
          }
        }

        // Evaluate with GPT-4
        console.log('  🤖 Evaluating with GPT-4...');
        const evaluation = await this.openaiClient.evaluateConversation(
          transcription.fullText,
          scenario.id,
          scenario.name,
          scenario.expectedBehavior,
          scenario.expectedAnswers
        );

        metrics.accuracy = evaluation.accuracy;
        metrics.naturalness = evaluation.naturalness;
        metrics.professionalism = evaluation.professionalism;
        metrics.hallucinations = evaluation.hallucinations;
        metrics.inaccuracies = evaluation.inaccuracies;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('  ⚠️  Error in transcription/evaluation:', errorMessage);
        metrics.errors.push(`Transcription/Evaluation error: ${errorMessage}`);
      }
    } else {
      console.log('  ⚠️  No recording available for this call');
      metrics.errors.push('No recording available');
    }

    return metrics;
  }

  /**
   * Load test scenarios from files
   */
  private async loadTestScenarios(category?: string): Promise<Scenario[]> {
    const scenarios: Scenario[] = [];

    for (const file of this.config.scenarioFiles) {
      const filePath = path.join(__dirname, 'test-scenarios', file);
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: Scenario file not found: ${filePath}`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      for (const scenario of data.scenarios) {
        if (!category || scenario.category === category) {
          scenarios.push(scenario);
        }
      }
    }

    return scenarios;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * Main execution
 */
async function main() {
  // Load environment variables
  const config: TestConfig = {
    prontoPhoneNumber: process.env.PRONTO_DEMO_PHONE_NUMBER || '',
    telnyxApiKey: process.env.TELNYX_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    telnyxCallControlAppId: process.env.TELNYX_CALL_CONTROL_APP_ID || '',
    fromNumber: process.env.TELNYX_PHONE_NUMBER || '',
    callDelaySeconds: parseInt(process.env.TEST_CALL_DELAY_SECONDS || '45', 10),
    scenarioFiles: [
      'greeting-tests.json',
      'information-tests.json',
      'appointment-tests.json',
      'insurance-tests.json',
      'emergency-tests.json',
      'edge-case-tests.json',
    ],
  };

  // Validate config
  if (!config.prontoPhoneNumber) {
    console.error('Error: PRONTO_DEMO_PHONE_NUMBER environment variable is required');
    process.exit(1);
  }
  if (!config.telnyxApiKey) {
    console.error('Error: TELNYX_API_KEY environment variable is required');
    process.exit(1);
  }
  if (!config.openaiApiKey) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  // Check for category filter
  const categoryArg = process.argv.indexOf('--category');
  const testCategory = categoryArg > -1 && process.argv[categoryArg + 1] 
    ? process.argv[categoryArg + 1] 
    : undefined;

  // Run tests
  const runner = new TestRunner(config);
  
  try {
    await runner.runTests(testCategory);
  } finally {
    await runner.cleanup();
  }
}

// Execute
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

