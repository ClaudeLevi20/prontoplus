import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { LeadsService } from './leads.service';
import { Call, DemoLead, LeadInterest } from '@prisma/client';

/**
 * Controller for managing calls and analytics
 * 
 * Provides endpoints for:
 * - Call listing and filtering
 * - Call details retrieval
 * - Call analytics
 * - Lead management
 */
@ApiTags('calls')
@Controller('api/v1/telnyx')
export class CallsController {
  private readonly logger = new Logger(CallsController.name);

  constructor(
    private prisma: PrismaService,
    private leadsService: LeadsService,
  ) {}

  /**
   * Get calls with filtering and pagination
   * 
   * @param filters - Filter options
   * @returns Promise<{ calls: Call[]; total: number; page: number; limit: number }>
   */
  @Get('calls')
  @ApiOperation({
    summary: 'Get calls list',
    description: 'Retrieve calls with filtering, sorting, and pagination options.',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by call status',
    required: false,
    enum: ['INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER'],
  })
  @ApiQuery({
    name: 'direction',
    description: 'Filter by call direction',
    required: false,
    enum: ['INBOUND', 'OUTBOUND'],
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Filter calls from this date (ISO string)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Filter calls until this date (ISO string)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number (1-based)',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of calls per page',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Calls retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        calls: {
          type: 'array',
          items: { $ref: '#/components/schemas/Call' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getCalls(
    @Query('status') status?: string,
    @Query('direction') direction?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{
    calls: (Call & { demoLead?: DemoLead })[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const pageNum = page && page > 0 ? page : 1;
      const limitNum = limit && limit > 0 ? Math.min(limit, 100) : 20;
      const offset = (pageNum - 1) * limitNum;

      const where: any = {};
      
      if (status) where.status = status;
      if (direction) where.direction = direction;
      
      if (startDate || endDate) {
        where.startedAt = {};
        if (startDate) where.startedAt.gte = new Date(startDate);
        if (endDate) where.startedAt.lte = new Date(endDate);
      }

      const [calls, total] = await Promise.all([
        this.prisma.call.findMany({
          where,
          include: {
            demoLead: true,
          },
          orderBy: {
            startedAt: 'desc',
          },
          take: limitNum,
          skip: offset,
        }),
        this.prisma.call.count({ where }),
      ]);

      return {
        calls,
        total,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      this.logger.error('Error fetching calls', error);
      throw error;
    }
  }

  /**
   * Get call details by ID
   * 
   * @param id - Call ID
   * @returns Promise<Call & { demoLead?: DemoLead }>
   */
  @Get('calls/:id')
  @ApiOperation({
    summary: 'Get call details',
    description: 'Retrieve detailed information about a specific call.',
  })
  @ApiParam({
    name: 'id',
    description: 'Call ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Call details retrieved successfully',
    schema: {
      $ref: '#/components/schemas/Call',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Call not found',
  })
  async getCallById(@Param('id') id: string): Promise<Call & { demoLead?: DemoLead }> {
    try {
      const call = await this.prisma.call.findUnique({
        where: { id },
        include: {
          demoLead: true,
        },
      });

      if (!call) {
        throw new NotFoundException(`Call with ID ${id} not found`);
      }

      return call;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching call ${id}`, error);
      throw error;
    }
  }

  /**
   * Get call analytics
   * 
   * @param filters - Analytics filter options
   * @returns Promise<any>
   */
  @Get('analytics')
  @ApiOperation({
    summary: 'Get call analytics',
    description: 'Retrieve aggregated analytics data for calls and leads.',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Analytics start date (ISO string)',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Analytics end date (ISO string)',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        calls: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            completed: { type: 'number' },
            averageDuration: { type: 'number' },
            completionRate: { type: 'number' },
          },
        },
        leads: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            captured: { type: 'number' },
            captureRate: { type: 'number' },
            interestBreakdown: { type: 'object' },
          },
        },
      },
    },
  })
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    try {
      const dateRange = startDate && endDate ? {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      } : undefined;

      const where: any = {};
      if (dateRange) {
        where.startedAt = {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        };
      }

      const [
        totalCalls,
        completedCalls,
        callsWithDuration,
        leadAnalytics,
      ] = await Promise.all([
        this.prisma.call.count({ where }),
        this.prisma.call.count({ where: { ...where, status: 'COMPLETED' } }),
        this.prisma.call.findMany({
          where: { ...where, status: 'COMPLETED', callDuration: { gt: 0 } },
          select: { callDuration: true },
        }),
        this.leadsService.getLeadAnalytics(dateRange),
      ]);

      const averageDuration = callsWithDuration.length > 0
        ? callsWithDuration.reduce((sum, call) => sum + call.callDuration, 0) / callsWithDuration.length
        : 0;

      const completionRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;

      return {
        calls: {
          total: totalCalls,
          completed: completedCalls,
          averageDuration: Math.round(averageDuration),
          completionRate: Math.round(completionRate * 100) / 100,
        },
        leads: leadAnalytics,
      };
    } catch (error) {
      this.logger.error('Error fetching analytics', error);
      throw error;
    }
  }

  /**
   * Update lead interest level
   * 
   * @param leadId - Lead ID
   * @param interest - New interest level
   * @returns Promise<DemoLead>
   */
  @Patch('leads/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update lead interest level',
    description: 'Update the interest level of a lead (hot, warm, cold, unqualified).',
  })
  @ApiParam({
    name: 'id',
    description: 'Lead ID',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        interestLevel: {
          type: 'string',
          enum: ['HOT', 'WARM', 'COLD', 'UNQUALIFIED'],
        },
      },
      required: ['interestLevel'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    schema: {
      $ref: '#/components/schemas/DemoLead',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lead not found',
  })
  async updateLeadInterest(
    @Param('id') leadId: string,
    @Body('interestLevel') interest: LeadInterest,
  ): Promise<DemoLead> {
    try {
      return await this.leadsService.updateLeadInterest(leadId, interest);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating lead ${leadId}`, error);
      throw error;
    }
  }

  /**
   * Get leads with filtering
   * 
   * @param filters - Lead filter options
   * @returns Promise<{ leads: DemoLead[]; total: number }>
   */
  @Get('leads')
  @ApiOperation({
    summary: 'Get leads list',
    description: 'Retrieve leads with filtering and pagination options.',
  })
  @ApiQuery({
    name: 'interestLevel',
    description: 'Filter by interest level',
    required: false,
    enum: ['HOT', 'WARM', 'COLD', 'UNQUALIFIED'],
  })
  @ApiQuery({
    name: 'captured',
    description: 'Filter by capture status',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of leads per page',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Number of leads to skip',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Leads retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        leads: {
          type: 'array',
          items: { $ref: '#/components/schemas/DemoLead' },
        },
        total: { type: 'number' },
      },
    },
  })
  async getLeads(
    @Query('interestLevel') interestLevel?: LeadInterest,
    @Query('captured') captured?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ leads: DemoLead[]; total: number }> {
    try {
      return await this.leadsService.getLeads({
        interestLevel,
        captured,
        limit,
        offset,
      });
    } catch (error) {
      this.logger.error('Error fetching leads', error);
      throw error;
    }
  }
}
