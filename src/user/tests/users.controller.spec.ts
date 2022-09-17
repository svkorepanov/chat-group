import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../entities/user.repository';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UserController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, UserRepository],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('find all', async () => {
    const result = await controller.getUsers();
    console.log(result);
  });
});
