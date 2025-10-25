import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PracticesService } from './practices.service';
import { CreatePracticeDto } from './dto/create-practice.dto';

@ApiTags('practices')
@Controller('practices')
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new practice' })
  @ApiResponse({ status: 201, description: 'Practice created successfully.' })
  create(@Body() createPracticeDto: CreatePracticeDto) {
    return this.practicesService.create(createPracticeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all practices' })
  @ApiResponse({ status: 200, description: 'Practices retrieved successfully.' })
  findAll() {
    return this.practicesService.findAll();
  }
}
