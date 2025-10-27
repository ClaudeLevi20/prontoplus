import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DemoLead, LeadInterest } from '@prisma/client';

/**
 * Service for managing demo leads from Telnyx calls
 * 
 * Provides business logic for:
 * - Lead capture from caller information
 * - Lead enrichment with additional data
 * - Lead status management
 * - Lead analytics and reporting
 */
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Capture lead from call with caller ID
   * 
   * @param callId - Call ID from database
   * @param callerPhone - Caller's phone number
   * @returns Promise<DemoLead>
   */
  async captureLeadFromCall(callId: string, callerPhone?: string): Promise<DemoLead> {
    try {
      // Check if lead already exists for this call
      const existingLead = await this.prisma.demoLead.findUnique({
        where: { callId },
      });

      if (existingLead) {
        this.logger.log(`Lead already exists for call ${callId}`);
        return existingLead;
      }

      const lead = await this.prisma.demoLead.create({
        data: {
          callId,
          callerPhone,
          captured: !!callerPhone,
          capturedAt: callerPhone ? new Date() : null,
        },
        include: {
          call: true,
        },
      });

      this.logger.log(`Lead captured for call ${callId}: ${lead.id}`);
      return lead;
    } catch (error) {
      this.logger.error(`Error capturing lead for call ${callId}`, error);
      throw error;
    }
  }

  /**
   * Enrich lead data with additional information
   * 
   * @param leadId - Lead ID
   * @param data - Additional lead data
   * @returns Promise<DemoLead>
   */
  async enrichLeadData(leadId: string, data: {
    email?: string;
    name?: string;
    practiceName?: string;
    notes?: string;
  }): Promise<DemoLead> {
    try {
      const lead = await this.prisma.demoLead.update({
        where: { id: leadId },
        data: {
          ...data,
          captured: true,
          capturedAt: new Date(),
        },
        include: {
          call: true,
        },
      });

      this.logger.log(`Lead enriched: ${leadId}`);
      return lead;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundException(`Lead with ID ${leadId} not found`);
      }
      this.logger.error(`Error enriching lead ${leadId}`, error);
      throw error;
    }
  }

  /**
   * Update lead interest level
   * 
   * @param leadId - Lead ID
   * @param interest - Interest level
   * @returns Promise<DemoLead>
   */
  async updateLeadInterest(leadId: string, interest: LeadInterest): Promise<DemoLead> {
    try {
      const lead = await this.prisma.demoLead.update({
        where: { id: leadId },
        data: { interestLevel: interest },
        include: {
          call: true,
        },
      });

      this.logger.log(`Lead interest updated: ${leadId} -> ${interest}`);
      return lead;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundException(`Lead with ID ${leadId} not found`);
      }
      this.logger.error(`Error updating lead interest ${leadId}`, error);
      throw error;
    }
  }

  /**
   * Get lead by call ID
   * 
   * @param callId - Call ID
   * @returns Promise<DemoLead | null>
   */
  async getLeadByCallId(callId: string): Promise<DemoLead | null> {
    try {
      return await this.prisma.demoLead.findUnique({
        where: { callId },
        include: {
          call: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error fetching lead for call ${callId}`, error);
      throw error;
    }
  }

  /**
   * Get all leads with filtering and pagination
   * 
   * @param filters - Filter options
   * @returns Promise<{ leads: DemoLead[]; total: number }>
   */
  async getLeads(filters: {
    interestLevel?: LeadInterest;
    captured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ leads: DemoLead[]; total: number }> {
    try {
      const { interestLevel, captured, limit = 50, offset = 0 } = filters;
      
      const where: any = {};
      if (interestLevel) where.interestLevel = interestLevel;
      if (captured !== undefined) where.captured = captured;

      const [leads, total] = await Promise.all([
        this.prisma.demoLead.findMany({
          where,
          include: {
            call: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        }),
        this.prisma.demoLead.count({ where }),
      ]);

      return { leads, total };
    } catch (error) {
      this.logger.error('Error fetching leads', error);
      throw error;
    }
  }

  /**
   * Get lead analytics
   * 
   * @param dateRange - Date range for analytics
   * @returns Promise<any>
   */
  async getLeadAnalytics(dateRange?: {
    startDate: Date;
    endDate: Date;
  }): Promise<any> {
    try {
      const where: any = {};
      
      if (dateRange) {
        where.createdAt = {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        };
      }

      const [
        totalLeads,
        capturedLeads,
        hotLeads,
        warmLeads,
        coldLeads,
        unqualifiedLeads,
      ] = await Promise.all([
        this.prisma.demoLead.count({ where }),
        this.prisma.demoLead.count({ where: { ...where, captured: true } }),
        this.prisma.demoLead.count({ where: { ...where, interestLevel: 'HOT' } }),
        this.prisma.demoLead.count({ where: { ...where, interestLevel: 'WARM' } }),
        this.prisma.demoLead.count({ where: { ...where, interestLevel: 'COLD' } }),
        this.prisma.demoLead.count({ where: { ...where, interestLevel: 'UNQUALIFIED' } }),
      ]);

      return {
        totalLeads,
        capturedLeads,
        captureRate: totalLeads > 0 ? (capturedLeads / totalLeads) * 100 : 0,
        interestBreakdown: {
          hot: hotLeads,
          warm: warmLeads,
          cold: coldLeads,
          unqualified: unqualifiedLeads,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching lead analytics', error);
      throw error;
    }
  }

  /**
   * Calculate lead score based on call engagement metrics
   * Score range: 0-100
   */
  async calculateLeadScore(callData: {
    duration: number;
    transcript?: string;
    sentiment?: number;
    topics?: string[];
  }): Promise<{
    score: number;
    quality: string;
    breakdown: Record<string, number>;
  }> {
    let score = 0;
    const breakdown: Record<string, number> = {};

    // Duration scoring (max 30 points)
    const durationPoints = Math.min(Math.floor(callData.duration / 10), 30);
    score += durationPoints;
    breakdown['call_duration'] = durationPoints;

    // Topic-based scoring
    const transcript = callData.transcript?.toLowerCase() || '';
    const topics = callData.topics || [];

    // Pricing interest (20 points)
    if (transcript.includes('cost') || transcript.includes('price') || 
        transcript.includes('how much') || topics.includes('pricing')) {
      score += 20;
      breakdown['pricing_interest'] = 20;
    }

    // Insurance questions (15 points)
    if (transcript.includes('insurance') || transcript.includes('coverage') ||
        topics.includes('insurance')) {
      score += 15;
      breakdown['insurance_interest'] = 15;
    }

    // Appointment scheduling (25 points - highest value)
    if (transcript.includes('appointment') || transcript.includes('schedule') ||
        transcript.includes('when can') || topics.includes('scheduling')) {
      score += 25;
      breakdown['appointment_intent'] = 25;
    }

    // Sentiment scoring (20 points max)
    if (callData.sentiment !== undefined) {
      const sentimentPoints = Math.round(callData.sentiment * 20);
      score += sentimentPoints;
      breakdown['positive_sentiment'] = sentimentPoints;
    }

    // Multiple questions asked (10 points)
    const questionCount = (transcript.match(/\?/g) || []).length;
    if (questionCount >= 3) {
      score += 10;
      breakdown['engagement'] = 10;
    }

    // Long call bonus (10 points for >3 minutes)
    if (callData.duration > 180) {
      score += 10;
      breakdown['long_call_bonus'] = 10;
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Determine quality
    let quality: string;
    if (score >= 75) {
      quality = 'HOT';
    } else if (score >= 50) {
      quality = 'WARM';
    } else {
      quality = 'COLD';
    }

    return { score, quality, breakdown };
  }

  /**
   * Enhanced lead capture with scoring
   */
  async captureAndScoreLead(
    callId: string, 
    callData: any
  ): Promise<DemoLead> {
    // Calculate score
    const scoring = await this.calculateLeadScore({
      duration: callData.duration || 0,
      transcript: callData.transcript,
      sentiment: callData.sentiment_score,
      topics: callData.topics_discussed,
    });

    // Check for deduplication
    const existingLead = await this.prisma.demoLead.findFirst({
      where: {
        callerPhone: callData.phone_number,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    // If duplicate within 7 days, update instead of create
    if (existingLead) {
      return await this.prisma.demoLead.update({
        where: { id: existingLead.id },
        data: {
          leadScore: scoring.score,
          leadQuality: scoring.quality,
          interestLevel: scoring.quality as LeadInterest,
          sentimentScore: callData.sentiment_score,
          questionsAsked: callData.topics_discussed || [],
          mentionedPricing: scoring.breakdown['pricing_interest'] > 0,
          mentionedInsurance: scoring.breakdown['insurance_interest'] > 0,
          mentionedScheduling: scoring.breakdown['appointment_intent'] > 0,
          qualificationNotes: JSON.stringify(scoring.breakdown),
        },
      });
    }

    // Create new lead
    return await this.prisma.demoLead.create({
      data: {
        callId,
        callerPhone: callData.phone_number,
        captured: true,
        capturedAt: new Date(),
        leadScore: scoring.score,
        leadQuality: scoring.quality,
        interestLevel: scoring.quality as LeadInterest,
        sentimentScore: callData.sentiment_score,
        questionsAsked: callData.topics_discussed || [],
        mentionedPricing: scoring.breakdown['pricing_interest'] > 0,
        mentionedInsurance: scoring.breakdown['insurance_interest'] > 0,
        mentionedScheduling: scoring.breakdown['appointment_intent'] > 0,
        qualificationNotes: JSON.stringify(scoring.breakdown),
      },
    });
  }

  /**
   * Mark lead as follow-up sent
   * 
   * @param leadId - Lead ID
   * @returns Promise<DemoLead>
   */
  async markFollowUpSent(leadId: string): Promise<DemoLead> {
    try {
      const lead = await this.prisma.demoLead.update({
        where: { id: leadId },
        data: { followUpSent: true },
        include: {
          call: true,
        },
      });

      this.logger.log(`Follow-up marked as sent for lead: ${leadId}`);
      return lead;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundException(`Lead with ID ${leadId} not found`);
      }
      this.logger.error(`Error marking follow-up sent for lead ${leadId}`, error);
      throw error;
    }
  }
}