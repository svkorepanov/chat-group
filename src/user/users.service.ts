import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './entities/user.repository';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  public async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { memberOfChannels: true },
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
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
