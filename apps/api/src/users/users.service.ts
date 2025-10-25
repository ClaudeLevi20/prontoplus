import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  // TODO: Implement Prisma integration
  private users = [];

  create(createUserDto: CreateUserDto) {
    const user = {
      id: 'temp-id-' + Date.now(),
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  findAll() {
    return this.users;
  }
}
