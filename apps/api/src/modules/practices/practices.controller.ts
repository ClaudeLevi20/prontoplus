import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { PracticesService } from './practices.service';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';
import { PracticeResponseDto } from './dto/practice-response.dto';
import { Practice } from '@prisma/client';

/**
 * Controller for managing orthodontic practices
 * 
 * Provides CRUD operations for practice management including:
 * - Creating new practices
 * - Retrieving practice information
 * - Updating practice details
 * - Deleting practices
 * - Filtering practices by owner
 */
@ApiTags('practices')
@Controller('practices')
@ApiExtraModels(CreatePracticeDto, UpdatePracticeDto, PracticeResponseDto)
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  /**
   * Create a new orthodontic practice
   * 
   * Creates a new practice record with the provided information.
   * The practice must be associated with an existing user as the owner.
   * 
   * @param createPracticeDto - Practice creation data
   * @returns Promise<Practice> - The created practice
   * @throws {NotFoundException} When the owner user is not found
   * @throws {ConflictException} When a practice with the same email already exists
   * @throws {BadRequestException} When input validation fails
   */
  @Post()
  @ApiOperation({ 
    summary: 'Create a new practice',
    description: 'Creates a new orthodontic practice with the provided information. The practice must be associated with an existing user as the owner.',
  })
  @ApiBody({ 
    type: CreatePracticeDto,
    description: 'Practice creation data including name, contact information, and owner ID',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Practice created successfully', 
    type: PracticeResponseDto,
    schema: {
      example: {
        id: 'clr1234567890abcdef',
        name: 'Smile Orthodontics',
        phoneNumber: '+1-555-0123',
        email: 'info@smileortho.com',
        address: '123 Main St, City, State 12345',
        ownerId: 'clr0987654321fedcba',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['name should not be empty', 'ownerId must be a valid UUID'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Owner user not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Practice with this email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Practice with this email already exists',
        error: 'Conflict'
      }
    }
  })
  create(@Body() createPracticeDto: CreatePracticeDto): Promise<Practice> {
    return this.practicesService.create(createPracticeDto);
  }

  /**
   * Get all practices or filter by owner
   * 
   * Retrieves a list of all practices. Optionally filters by owner ID
   * to get practices belonging to a specific user.
   * 
   * @param ownerId - Optional owner ID to filter practices
   * @returns Promise<Practice[]> - Array of practices
   */
  @Get()
  @ApiOperation({ 
    summary: 'Get all practices',
    description: 'Retrieves a list of all practices. Optionally filter by owner ID to get practices belonging to a specific user.',
  })
  @ApiQuery({ 
    name: 'ownerId', 
    description: 'Filter practices by owner ID (UUID)', 
    required: false,
    type: String,
    example: 'clr0987654321fedcba'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Practices retrieved successfully', 
    type: [PracticeResponseDto],
    schema: {
      example: [
        {
          id: 'clr1234567890abcdef',
          name: 'Smile Orthodontics',
          phoneNumber: '+1-555-0123',
          email: 'info@smileortho.com',
          address: '123 Main St, City, State 12345',
          ownerId: 'clr0987654321fedcba',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z'
        }
      ]
    }
  })
  findAll(@Query('ownerId') ownerId?: string): Promise<Practice[]> {
    if (ownerId) {
      return this.practicesService.findByOwner(ownerId);
    }
    return this.practicesService.findAll();
  }

  /**
   * Get a practice by ID
   * 
   * Retrieves a specific practice by its unique identifier.
   * 
   * @param id - Practice ID (UUID)
   * @returns Promise<Practice> - The practice data
   * @throws {NotFoundException} When the practice is not found
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get practice by ID',
    description: 'Retrieves a specific practice by its unique identifier.',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Practice ID (UUID)', 
    type: 'string',
    example: 'clr1234567890abcdef'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Practice retrieved successfully', 
    type: PracticeResponseDto,
    schema: {
      example: {
        id: 'clr1234567890abcdef',
        name: 'Smile Orthodontics',
        phoneNumber: '+1-555-0123',
        email: 'info@smileortho.com',
        address: '123 Main St, City, State 12345',
        ownerId: 'clr0987654321fedcba',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Practice not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Practice not found',
        error: 'Not Found'
      }
    }
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Practice> {
    return this.practicesService.findOne(id);
  }

  /**
   * Update a practice by ID
   * 
   * Updates an existing practice with the provided data.
   * Only the fields provided in the update DTO will be modified.
   * 
   * @param id - Practice ID (UUID)
   * @param updatePracticeDto - Practice update data
   * @returns Promise<Practice> - The updated practice
   * @throws {NotFoundException} When the practice is not found
   * @throws {ConflictException} When a practice with the same email already exists
   */
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update practice by ID',
    description: 'Updates an existing practice with the provided data. Only the fields provided in the update DTO will be modified.',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Practice ID (UUID)', 
    type: 'string',
    example: 'clr1234567890abcdef'
  })
  @ApiBody({ 
    type: UpdatePracticeDto,
    description: 'Practice update data. Only provided fields will be updated.',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Practice updated successfully', 
    type: PracticeResponseDto,
    schema: {
      example: {
        id: 'clr1234567890abcdef',
        name: 'Updated Smile Orthodontics',
        phoneNumber: '+1-555-0123',
        email: 'info@smileortho.com',
        address: '456 New St, City, State 12345',
        ownerId: 'clr0987654321fedcba',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T11:45:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Practice not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Practice not found',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Practice with this email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Practice with this email already exists',
        error: 'Conflict'
      }
    }
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePracticeDto: UpdatePracticeDto,
  ): Promise<Practice> {
    return this.practicesService.update(id, updatePracticeDto);
  }

  /**
   * Delete a practice by ID
   * 
   * Permanently removes a practice from the system.
   * This action cannot be undone.
   * 
   * @param id - Practice ID (UUID)
   * @returns Promise<void>
   * @throws {NotFoundException} When the practice is not found
   */
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete practice by ID',
    description: 'Permanently removes a practice from the system. This action cannot be undone.',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Practice ID (UUID)', 
    type: 'string',
    example: 'clr1234567890abcdef'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Practice deleted successfully',
    schema: {
      example: {
        message: 'Practice deleted successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Practice not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Practice not found',
        error: 'Not Found'
      }
    }
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.practicesService.remove(id);
  }
}
