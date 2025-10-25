import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsUUID } from 'class-validator';

export class CreatePracticeDto {
  @ApiProperty({ description: 'Practice name', example: 'Smile Orthodontics' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Phone number', example: '+1-555-123-4567', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'Email address', example: 'info@smileortho.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Practice address', example: '123 Main St, City, State 12345', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Owner user ID', example: 'clx1234567890abcdef' })
  @IsUUID()
  ownerId: string;
}
