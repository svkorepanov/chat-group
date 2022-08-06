import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './user.entity';
import { getUserRepository } from './user.repository';

@Injectable()
export class UserService {
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

  createUser(username: string): Promise<User> {
    return this.userRepository.save({ username });
  }
}
