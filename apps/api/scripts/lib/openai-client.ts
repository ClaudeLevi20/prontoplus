import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

/**
 * OpenAI Client for Whisper transcription and GPT-4 evaluation
 */

interface TranscriptSegment {
  text: string;
  start: number; // seconds
  end: number; // seconds
}

interface TranscriptionResult {
  segments: TranscriptSegment[];
  fullText: string;
}

interface EvaluationResult {
  accuracy: number;
  naturalness: number;
  professionalism: number;
  hallucinations: string[];
  inaccuracies: string[];
  boundaryViolations: string[];
  recommendations: string[];
}

export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Download recording from URL and transcribe using Whisper API
   * 
   * @param recordingUrl - URL of the recording file
   * @returns Promise<TranscriptionResult>
   */
  async transcribeRecording(recordingUrl: string): Promise<TranscriptionResult> {
    try {
      console.log(`Downloading recording from: ${recordingUrl}`);
      
      // Download the file
      const response = await axios.get(recordingUrl, {
        responseType: 'arraybuffer',
      });
      
      const audioBuffer = Buffer.from(response.data);
      const tempFilePath = path.join('/tmp', `recording-${Date.now()}.mp3`);
      fs.writeFileSync(tempFilePath, audioBuffer);
      
      console.log(`Transcribing audio file: ${tempFilePath}`);
      
      // Transcribe with timestamps
      const transcription = await this.client.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
      // Parse transcription result
      const segments: TranscriptSegment[] = (transcription as any).segments?.map((seg: any) => ({
        text: seg.text,
        start: seg.start,
        end: seg.end,
      })) || [];
      
      const fullText = (transcription as any).text || '';
      
      console.log(`Transcription complete. ${segments.length} segments, ${fullText.length} chars`);
      
      return {
        segments,
        fullText,
      };
    } catch (error) {
      console.error('Error transcribing recording:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Transcription failed: ${errorMessage}`);
    }
  }

  /**
   * Evaluate conversation with GPT-4
   * 
   * @param transcript - Full conversation transcript
   * @param scenarioId - Test scenario ID
   * @param scenarioName - Test scenario name
   * @param expectedBehavior - Expected AI behavior
   * @param expectedAnswers - Expected answers
   * @returns Promise<EvaluationResult>
   */
  async evaluateConversation(
    transcript: string,
    scenarioId: string,
    scenarioName: string,
    expectedBehavior: string,
    expectedAnswers: string[]
  ): Promise<EvaluationResult> {
    try {
      const prompt = `You are evaluating an AI receptionist call for an orthodontic practice. Analyze the conversation transcript and provide ratings.

**Scenario:** ${scenarioName}
**Scenario ID:** ${scenarioId}
**Expected Behavior:** ${expectedBehavior}
**Expected Answers:** ${expectedAnswers.join(', ')}

**Conversation Transcript:**
${transcript}

**Your Task:**
1. Rate accuracy (0-5): Did the AI provide correct information about orthodontic services?
2. Rate naturalness (0-5): Did the conversation flow naturally without robotic responses?
3. Rate professionalism (0-5): Was the tone appropriate for a medical practice?
4. List any hallucinations (incorrect information made up by the AI)
5. List any inaccuracies (incorrect facts about the practice or services)
6. Note any boundary violations (did the AI provide medical advice or overstep?)
7. Provide 3 specific improvement recommendations

**Return your evaluation as JSON with this exact structure:**
{
  "accuracy": <number 0-5>,
  "naturalness": <number 0-5>,
  "professionalism": <number 0-5>,
  "hallucinations": ["<issue 1>", "<issue 2>", ...],
  "inaccuracies": ["<issue 1>", "<issue 2>", ...],
  "boundaryViolations": ["<issue 1>", "<issue 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}`;

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert evaluator of AI customer service conversations. Provide detailed, objective analysis in structured JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('No response from GPT-4');
      }

      // Parse JSON response
      const evaluation = JSON.parse(responseText) as EvaluationResult;
      
      console.log(`Evaluation complete for ${scenarioId}`);
      
      return evaluation;
    } catch (error) {
      console.error('Error evaluating conversation:', error);
      // Return default values on error
      return {
        accuracy: 0,
        naturalness: 0,
        professionalism: 0,
        hallucinations: ['Evaluation failed'],
        inaccuracies: [],
        boundaryViolations: [],
        recommendations: ['Review evaluation manually'],
      };
    }
  }

  /**
   * Generate recommendations for improving AI performance
   * 
   * @param results - Array of test results
   * @returns Promise<string[]> - Prioritized recommendations
   */
  async generateRecommendations(results: any[]): Promise<string[]> {
    try {
      const summary = results.map(r => ({
        scenario: r.scenarioName,
        accuracy: r.accuracy,
        naturalness: r.naturalness,
        professionalism: r.professionalism,
        hallucinations: r.hallucinations?.length || 0,
        inaccuracies: r.inaccuracies?.length || 0,
        issues: [...(r.hallucinations || []), ...(r.inaccuracies || [])],
      }));

      const prompt = `You are analyzing test results for an AI receptionist. Identify the top 10 improvement areas based on these results:

${JSON.stringify(summary, null, 2)}

Provide 10 specific, actionable recommendations prioritized by impact and frequency of issues. Return as a JSON array of strings.`;

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI consultant specializing in conversational AI optimization.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        return [];
      }

      const recommendations = JSON.parse(responseText) as string[];
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
}

