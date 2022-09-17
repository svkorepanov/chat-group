import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/user.entity';
import { UserRepository } from '../entities/user.repository';
import { UsersService } from '../users.service';
import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere } from 'typeorm';

describe('UserService', () => {
  let service: UsersService;
  let userRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, UserRepository],
    })
      .overrideProvider(UserRepository)
      .useValue(userRepository)
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      userRepository.find.mockResolvedValue([buildUser(), buildUser()]);

      const result = await service.findAll();
      expect(userRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return a user', async () => {
      const user = buildUser();
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findById(user.id);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith<
        FindOneOptions<User>[]
      >({
        where: { id: user.id },
      });
      expect(result).toMatchObject(user);
    });

    it('should throw an error if sql result empty', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user', async () => {
      const user = buildUser();
      userRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findByEmail(user.email);
      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith<
        FindOptionsWhere<User>[]
      >({
        email: user.email,
      });
      expect(result).toMatchObject(user);
    });

    it('should throw an error if sql result empty', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findByEmail('')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});

function buildUser(): User {
  const user = new User();
  user.id = faker.datatype.number();
  user.email = faker.internet.email();

  return user;
}
