import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  // @Post()
  // createUser(@Body('username') username: string): Promise<User> {
  //   if (!username) {
  //     throw new BadRequestException();
  //   }
  //   return this.userService.createUser(username);
  // }
}
