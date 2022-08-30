import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GetUser } from '../authentication/decorators/user-request.decorator';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.findById(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateMe(
    @Body() fieldsToUpdate: UpdateUserDto,
    @GetUser() user: User,
  ): Promise<User> {
    return await this.userService.updateUser(user, fieldsToUpdate);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@GetUser() user: User): Promise<User> {
    return await this.userService.deleteUser(user);
  }
}
