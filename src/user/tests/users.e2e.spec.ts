import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../users.module';
import { DataBaseModule } from '../../db/db.module';
import { UserRepository } from '../entities/user.repository';
import { User } from '../entities/user.entity';
import { faker } from '@faker-js/faker';
import { AuthenticationModule } from '../../authentication/authentication.module';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../authentication/dto/jwt.dto';

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, DataBaseModule, AuthenticationModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await userRepository.query('DELETE FROM users');
    await app.close();
  });

  describe('(GET) /users', () => {
    it('success', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);

      const { body } = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(body).toEqual([
        expect.objectContaining({ email: user1.email }),
        expect.objectContaining({ email: user2.email }),
      ]);
    });
  });

  describe('(GET) /users/me', () => {
    it('success', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);
      const jwtToken = jwtService.sign(buildJwtPayload(user2));

      const { body } = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ email: user2.email }));
    });
    it('should not return password', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);
      const jwtToken = jwtService.sign(buildJwtPayload(user2));

      const { body } = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ email: user2.email }));
      expect(body.password).toBeUndefined();
    });

    it('Unauthorized', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);

      await request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });

  describe('(GET) /users/:id', () => {
    it('success', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);
      const jwtToken = jwtService.sign(buildJwtPayload(user2));

      const { body } = await request(app.getHttpServer())
        .get(`/users/${user1.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ email: user1.email }));
    });

    it('Unauthorized', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);

      await request(app.getHttpServer()).get('/users/id').expect(401);
    });
  });

  describe('(PATCH) /users/me', () => {
    it('success', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);
      const jwtToken = jwtService.sign(buildJwtPayload(user2));

      const userUpdateBody = {
        bio: 'new bio',
        phone: '79991234545',
      };
      const { body } = await request(app.getHttpServer())
        .patch(`/users/me`)
        .send(userUpdateBody)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ id: user2.id }));
      expect(body.bio).toEqual(userUpdateBody.bio);
      expect(body.phone).toEqual(userUpdateBody.phone);
    });

    it('should reject excessive properties in body', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);
      const jwtToken = jwtService.sign(buildJwtPayload(user2));

      const userUpdateBody = {
        name: 'new name',
        whiteListedProp: 'should be rejected',
      };
      await request(app.getHttpServer())
        .patch(`/users/me`)
        .send(userUpdateBody)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    it('should reject invalid properties', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);
      const jwtToken = jwtService.sign(buildJwtPayload(user2));

      const userUpdateBody = {
        name: '',
        phone: '7999123454500',
        bio: faker.datatype.string(250),
      };
      await request(app.getHttpServer())
        .patch(`/users/me`)
        .send(userUpdateBody)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    it('Unauthorized', async () => {
      const user1 = buildUser();
      const user2 = buildUser();
      await userRepository.save([user1, user2]);
      const userUpdateBody = {
        name: 'new name',
        whiteListedProp: 'should be rejected',
      };
      await request(app.getHttpServer())
        .patch(`/users/me`)
        .send(userUpdateBody)
        .expect(401);
    });
  });
});

function buildUser(ovverrides: Partial<User> = {}): User {
  const user = new User();
  user.id = faker.datatype.number();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  user.name = faker.name.firstName();
  user.bio = faker.lorem.sentence(10);
  user.phone = faker.phone.number('###########');

  Object.entries(ovverrides).forEach(([key, value]) => {
    user[key] = value;
  });

  return user;
}

function buildJwtPayload(user: User): JwtPayload {
  return { username: user.name, sub: user.id };
}
