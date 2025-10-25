import { ApiProperty } from '@nestjs/swagger';

export class PracticeResponseDto {
  @ApiProperty({ description: 'Practice ID', example: 'clx1234567890abcdef' })
  id: string;

  @ApiProperty({ description: 'Practice name', example: 'Smile Orthodontics' })
  name: string;

  @ApiProperty({ description: 'Phone number', example: '+1-555-123-4567', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Email address', example: 'info@smileortho.com', required: false })
  email?: string;

  @ApiProperty({ description: 'Practice address', example: '123 Main St, City, State 12345', required: false })
  address?: string;

  @ApiProperty({ description: 'Owner user ID', example: 'clx1234567890abcdef' })
  ownerId: string;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Practice owner', type: 'object' })
  owner: any;
}
