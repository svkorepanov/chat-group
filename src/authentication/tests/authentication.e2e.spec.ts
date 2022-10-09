import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRepository } from '../../user/entities/user.repository';
import { UsersSeeder } from '../../user/tests/users.seed';
import { AuthenticationModule } from '../authentication.module';
import * as request from 'supertest';
import { DataBaseModule } from '../../db/db.module';
import { faker } from '@faker-js/faker';
import { AuthenticationService } from '../authentication.service';

describe('Authentication Controller (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let usersSeeder: UsersSeeder;
  let authService: AuthenticationService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthenticationModule, DataBaseModule],
      providers: [UsersSeeder],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get(UserRepository);
    usersSeeder = module.get(UsersSeeder);
    authService = module.get(AuthenticationService);

    app.init();
  });

  afterAll(async () => {
    app.close();
  });

  describe('(POST) /authentication/signup', () => {
    it('success', async () => {
      const signUpBody = {
        email: faker.internet.email(),
        password: '12345678',
      };

      const { body } = await request(app.getHttpServer())
        .post('/authentication/signup')
        .send(signUpBody)
        .expect(201);

      expect(body).toEqual(
        expect.objectContaining({ email: signUpBody.email }),
      );
      expect(body.password).toBeUndefined();
      expect(body.deletedAt).toBeUndefined();

      const foundUser = await userRepository.findOne({
        where: { email: signUpBody.email },
      });
      expect(foundUser).toBeDefined();
    });

    it('should reject if password too short', async () => {
      const signUpBody = {
        email: faker.internet.email(),
        password: '123456',
      };

      await request(app.getHttpServer())
        .post('/authentication/signup')
        .send(signUpBody)
        .expect(400);

      const foundUser = await userRepository.findOne({
        where: { email: signUpBody.email },
      });
      expect(foundUser).toBeFalsy();
    });
  });

  describe('(POST) /authentication/signin', () => {
    it('success', async () => {
      const user1 = usersSeeder.buildUser();
      await authService.singUp({
        email: user1.email,
        password: user1.password,
      });

      const { body } = await request(app.getHttpServer())
        .post('/authentication/signin')
        .send({ email: user1.email, password: user1.password })
        .expect(200);

      expect(body.accessToken).toBeDefined();
    });

    it('should reject when the password is incorrect', async () => {
      const user1 = usersSeeder.buildUser();
      await authService.singUp({
        email: user1.email,
        password: user1.password,
      });

      await request(app.getHttpServer())
        .post('/authentication/signin')
        .send({ email: user1.email, password: 'wrong password' })
        .expect(401);
    });

    it('should reject when an email is incorrect', async () => {
      const user1 = usersSeeder.buildUser();
      await authService.singUp({
        email: user1.email,
        password: user1.password,
      });

      await request(app.getHttpServer())
        .post('/authentication/signin')
        .send({ email: 'wrong email', password: user1.password })
        .expect(401);
    });
  });
});
