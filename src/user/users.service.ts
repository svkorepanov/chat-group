import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
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

  public async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async findByemail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User with ${email} does not exist`);
    }

    return user;
  }

  async updateUser(user: User, fieldsToUpdate: UpdateUserDto): Promise<User> {
    const newUser = this.userRepository.merge(user, fieldsToUpdate);
    await this.userRepository.save(newUser);

    return newUser;
  }

  async create(userData: CreateUserDto) {
    const newUser = this.userRepository.create({
      ...userData,
      name: userData.email,
    });
    await this.userRepository.save(newUser);
    return newUser;
  }

  async deleteUser(user: User) {
    return await this.userRepository.softRemove(user);
  }
}
