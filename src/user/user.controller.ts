import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post()
  createUser(@Body('username') username: string): Promise<User> {
    if (!username) {
      throw new BadRequestException();
    }
    return this.userService.createUser(username);
  }
}
