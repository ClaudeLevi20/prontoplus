/**
 * Report Generator for Test Results
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  scenarioId: string;
  scenarioName: string;
  category: string;
  passed: boolean;
  accuracy: number;
  naturalness: number;
  professionalism: number;
  callDuration: number;
  initialResponseTime?: number;
  avgResponseTime?: number;
  maxResponseTime?: number;
  awkwardPauses: number;
  hallucinations: string[];
  inaccuracies: string[];
  errors: string[];
  recommendations: string[];
}

export interface ReportSummary {
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  passRate: number;
  avgAccuracy: number;
  avgNaturalness: number;
  avgProfessionalism: number;
  avgCallDuration: number;
  totalHallucinations: number;
  totalInaccuracies: number;
  topIssues: string[];
  topRecommendations: string[];
}

export class ReportGenerator {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  /**
   * Generate JSON report
   */
  generateJSONReport(testRunId: string, results: TestResult[]): void {
    const summary = this.calculateSummary(results);
    
    const report = {
      testRunId,
      timestamp: new Date().toISOString(),
      summary,
      results,
    };

    const reportPath = path.join(this.outputDir, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`JSON report saved to: ${reportPath}`);
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(testRunId: string, results: TestResult[], topRecommendations: string[]): void {
    const summary = this.calculateSummary(results);
    
    const html = this.createHTMLTemplate(testRunId, summary, results, topRecommendations);
    
    const reportPath = path.join(this.outputDir, 'report.html');
    fs.writeFileSync(reportPath, html);
    
    console.log(`HTML report saved to: ${reportPath}`);
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(results: TestResult[]): ReportSummary {
    const totalScenarios = results.length;
    const passedScenarios = results.filter(r => r.passed).length;
    const failedScenarios = totalScenarios - passedScenarios;
    const passRate = totalScenarios > 0 ? (passedScenarios / totalScenarios) * 100 : 0;
    
    const avgAccuracy = this.average(results.map(r => r.accuracy));
    const avgNaturalness = this.average(results.map(r => r.naturalness));
    const avgProfessionalism = this.average(results.map(r => r.professionalism));
    const avgCallDuration = this.average(results.map(r => r.callDuration));
    
    const totalHallucinations = results.reduce((sum, r) => sum + r.hallucinations.length, 0);
    const totalInaccuracies = results.reduce((sum, r) => sum + r.inaccuracies.length, 0);
    
    // Collect top issues
    const allIssues = results.flatMap(r => [
      ...r.hallucinations,
      ...r.inaccuracies,
      ...r.errors,
    ]);
    const topIssues = this.getTopItems(allIssues, 10);
    
    // Collect top recommendations
    const allRecs = results.flatMap(r => r.recommendations);
    const topRecommendations = this.getTopItems(allRecs, 10);

    return {
      totalScenarios,
      passedScenarios,
      failedScenarios,
      passRate,
      avgAccuracy,
      avgNaturalness,
      avgProfessionalism,
      avgCallDuration,
      totalHallucinations,
      totalInaccuracies,
      topIssues,
      topRecommendations,
    };
  }

  /**
   * Create HTML template
   */
  private createHTMLTemplate(
    testRunId: string,
    summary: ReportSummary,
    results: TestResult[],
    topRecommendations: string[]
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pronto Demo Test Report - ${testRunId}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 10px; }
    .subtitle { color: #666; margin-bottom: 30px; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
    .summary-card .value { font-size: 32px; font-weight: bold; color: #333; }
    .summary-card .label { color: #999; font-size: 12px; margin-top: 5px; }
    .pass { color: #28a745; }
    .fail { color: #dc3545; }
    .results-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      margin-bottom: 30px;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; }
    th { background: #f8f9fa; font-weight: 600; color: #666; }
    tr:nth-child(even) { background: #f8f9fa; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-pass { background: #d4edda; color: #155724; }
    .badge-fail { background: #f8d7da; color: #721c24; }
    .recommendations {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .recommendations ul { margin-top: 10px; }
    .recommendations li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Pronto Demo AI Receptionist Test Report</h1>
    <p class="subtitle">Test Run: ${testRunId} | ${new Date().toLocaleString()}</p>
    
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Test Summary</h3>
        <div class="value">${summary.totalScenarios} Total</div>
        <div class="label">${summary.passedScenarios} Passed • ${summary.failedScenarios} Failed</div>
      </div>
      <div class="summary-card">
        <h3>Pass Rate</h3>
        <div class="value ${summary.passRate >= 80 ? 'pass' : 'fail'}">${summary.passRate.toFixed(1)}%</div>
      </div>
      <div class="summary-card">
        <h3>Avg Accuracy</h3>
        <div class="value">${summary.avgAccuracy.toFixed(1)}/5</div>
      </div>
      <div class="summary-card">
        <h3>Avg Naturalness</h3>
        <div class="value">${summary.avgNaturalness.toFixed(1)}/5</div>
      </div>
      <div class="summary-card">
        <h3>Avg Professionalism</h3>
        <div class="value">${summary.avgProfessionalism.toFixed(1)}/5</div>
      </div>
      <div class="summary-card">
        <h3>Avg Call Duration</h3>
        <div class="value">${Math.round(summary.avgCallDuration)}s</div>
      </div>
    </div>
    
    <div class="results-table">
      <table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Category</th>
            <th>Status</th>
            <th>Accuracy</th>
            <th>Naturalness</th>
            <th>Professionalism</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => `
            <tr>
              <td>${r.scenarioName}</td>
              <td>${r.category}</td>
              <td><span class="badge ${r.passed ? 'badge-pass' : 'badge-fail'}">${r.passed ? 'PASS' : 'FAIL'}</span></td>
              <td>${r.accuracy.toFixed(1)}</td>
              <td>${r.naturalness.toFixed(1)}</td>
              <td>${r.professionalism.toFixed(1)}</td>
              <td>${r.callDuration}s</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    ${topRecommendations.length > 0 ? `
    <div class="recommendations">
      <h2>Top Recommendations</h2>
      <ul>
        ${topRecommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
  }

  /**
   * Helper functions
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private getTopItems(items: string[], count: number): string[] {
    const counts = new Map<string, number>();
    items.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
    
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([item]) => item);
  }
}
