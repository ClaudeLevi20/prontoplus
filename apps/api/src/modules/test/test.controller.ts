import { Controller, Post, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Controller('test')
export class TestController {
  private readonly logger = new Logger(TestController.name);

  @Post('run')
  async runTests() {
    this.logger.log('Starting automated test run...');
    
    try {
      // Run the test script directly
      const { stdout, stderr } = await execAsync('cd /app/apps/api && pnpm test:pronto');
      
      this.logger.log('Test run completed');
      this.logger.log('Output:', stdout);
      
      if (stderr) {
        this.logger.warn('Test run warnings:', stderr);
      }

      return { 
        success: true, 
        message: 'Test run completed successfully',
        output: stdout,
        warnings: stderr
      };
    } catch (error) {
      this.logger.error('Test run failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
}
