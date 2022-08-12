import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { getUserRepository } from './user.repository';

@Injectable()
export class UsersService {
  private userRepository: ReturnType<typeof getUserRepository>;

  constructor(private dataSource: DataSource) {
    this.userRepository = getUserRepository(this.dataSource);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  async findByemail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User with ${email} does not exist`);
    }

    return user;
  }

  async create(userData: CreateUserDto) {
    const newUser = this.userRepository.create({
      ...userData,
      name: userData.email,
    });
    await this.userRepository.save(newUser);
    return newUser;
  }
}
