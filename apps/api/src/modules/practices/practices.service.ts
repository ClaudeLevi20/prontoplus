import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';
import { Practice } from '@prisma/client';

/**
 * Service for managing orthodontic practices
 * 
 * Provides business logic for practice operations including:
 * - Creating new practices with owner validation
 * - Retrieving practices with filtering capabilities
 * - Updating practice information
 * - Deleting practices
 * - Handling database constraints and errors
 */
@Injectable()
export class PracticesService {
  private readonly logger = new Logger(PracticesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new practice
   * 
   * Creates a new practice record after validating that the owner exists.
   * Handles database constraints and provides detailed error messages.
   * 
   * @param createPracticeDto - Practice creation data
   * @returns Promise<Practice> - The created practice with owner information
   * @throws {NotFoundException} When the owner user is not found
   * @throws {ConflictException} When a practice with the same email already exists
   */
  async create(createPracticeDto: CreatePracticeDto): Promise<Practice> {
    try {
      // Verify owner exists
      const owner = await this.prisma.user.findUnique({
        where: { id: createPracticeDto.ownerId },
      });

      if (!owner) {
        throw new NotFoundException(`User with ID ${createPracticeDto.ownerId} not found`);
      }

      const practice = await this.prisma.practice.create({
        data: {
          name: createPracticeDto.name,
          phoneNumber: createPracticeDto.phoneNumber,
          email: createPracticeDto.email,
          address: createPracticeDto.address,
          ownerId: createPracticeDto.ownerId,
        },
        include: {
          owner: true,
        },
      });

      this.logger.log(`Practice created: ${practice.id}`);
      return practice;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A practice with this email already exists');
      }
      this.logger.error('Error creating practice:', error);
      throw error;
    }
  }

  /**
   * Retrieve all practices
   * 
   * Fetches all practices from the database with owner information,
   * ordered by creation date (newest first).
   * 
   * @returns Promise<Practice[]> - Array of all practices with owner data
   */
  async findAll(): Promise<Practice[]> {
    return this.prisma.practice.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find a practice by ID
   * 
   * Retrieves a specific practice by its unique identifier.
   * Includes owner information in the response.
   * 
   * @param id - Practice ID (UUID)
   * @returns Promise<Practice> - The practice with owner information
   * @throws {NotFoundException} When the practice is not found
   */
  async findOne(id: string): Promise<Practice> {
    const practice = await this.prisma.practice.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });

    if (!practice) {
      throw new NotFoundException(`Practice with ID ${id} not found`);
    }

    return practice;
  }

  /**
   * Find practices by owner ID
   * 
   * Retrieves all practices belonging to a specific user.
   * Results are ordered by creation date (newest first).
   * 
   * @param ownerId - Owner user ID (UUID)
   * @returns Promise<Practice[]> - Array of practices owned by the user
   */
  async findByOwner(ownerId: string): Promise<Practice[]> {
    return this.prisma.practice.findMany({
      where: { ownerId },
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update a practice
   * 
   * Updates an existing practice with the provided data.
   * Validates owner existence if ownerId is being updated.
   * Handles database constraints and provides detailed error messages.
   * 
   * @param id - Practice ID (UUID)
   * @param updatePracticeDto - Practice update data
   * @returns Promise<Practice> - The updated practice with owner information
   * @throws {NotFoundException} When the practice or new owner is not found
   * @throws {ConflictException} When a practice with the same email already exists
   */
  async update(id: string, updatePracticeDto: UpdatePracticeDto): Promise<Practice> {
    try {
      // If updating owner, verify new owner exists
      if (updatePracticeDto.ownerId) {
        const owner = await this.prisma.user.findUnique({
          where: { id: updatePracticeDto.ownerId },
        });

        if (!owner) {
          throw new NotFoundException(`User with ID ${updatePracticeDto.ownerId} not found`);
        }
      }

      const practice = await this.prisma.practice.update({
        where: { id },
        data: updatePracticeDto,
        include: {
          owner: true,
        },
      });

      this.logger.log(`Practice updated: ${practice.id}`);
      return practice;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Practice with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException('A practice with this email already exists');
      }
      this.logger.error('Error updating practice:', error);
      throw error;
    }
  }

  /**
   * Remove a practice
   * 
   * Permanently deletes a practice from the database.
   * This action cannot be undone.
   * 
   * @param id - Practice ID (UUID)
   * @returns Promise<void>
   * @throws {NotFoundException} When the practice is not found
   */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.practice.delete({
        where: { id },
      });

      this.logger.log(`Practice deleted: ${id}`);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Practice with ID ${id} not found`);
      }
      this.logger.error('Error deleting practice:', error);
      throw error;
    }
  }
}
