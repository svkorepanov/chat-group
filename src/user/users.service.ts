import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PgErrorCodes } from '../constants/postgres';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './entities/user.repository';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}
  private readonly logger = new Logger(UsersService.name);

  public async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  public async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      this.logger.error(`User ${id} not found`);
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  public async findUserChannels(id: number) {
    const userWithChannels = await this.userRepository.findOne({
      select: { memberOfChannels: { channelId: true } },
      where: { id },
      relations: {
        memberOfChannels: true,
      },
    });

    return userWithChannels.memberOfChannels;
  }

  public async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      this.logger.error(`User ${email} not found`);
      throw new NotFoundException(`User with ${email} does not exist`);
    }

    return user;
  }

  public async updateUser(
    user: User,
    fieldsToUpdate: UpdateUserDto,
  ): Promise<User> {
    const newUser = this.userRepository.merge(user, fieldsToUpdate);
    await this.userRepository.save(newUser);

    return newUser;
  }

  public async create(userData: CreateUserDto) {
    const newUser = this.userRepository.create({
      ...userData,
      name: userData.email,
    });
    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error?.code === PgErrorCodes.UniqueViolation) {
        this.logger.error(`User with email '${userData.email}' alread exists`);
        throw new ConflictException(
          `User with email '${userData.email}' alread exists`,
        );
      }

      throw error;
    }
  }

  public async deleteUser(user: User) {
    const deletedUser = await this.userRepository.remove(user);
    this.logger.log(`User ${user.id} has been deleted`);

    return deletedUser;
  }
}
