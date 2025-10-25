import { Injectable } from '@nestjs/common';
import { CreatePracticeDto } from './dto/create-practice.dto';

@Injectable()
export class PracticesService {
  // TODO: Implement Prisma integration
  private practices = [];

  create(createPracticeDto: CreatePracticeDto) {
    const practice = {
      id: 'temp-id-' + Date.now(),
      ...createPracticeDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.practices.push(practice);
    return practice;
  }

  findAll() {
    return this.practices;
  }
}
