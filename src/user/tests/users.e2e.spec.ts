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
import { Channel } from '../../channels/entities/channel.entity';
import { ChannelRepository } from '../../channels/entities/channel.repository';
import { ChannelMembersRepository } from '../../channels/entities/channel-members.repository';
import { UsersSeeder } from './users.seed';

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let channelRepository: ChannelRepository;
  let channelMembersRepository: ChannelMembersRepository;
  let jwtService: JwtService;
  let usersSeeder: UsersSeeder;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, DataBaseModule, AuthenticationModule],
      providers: [ChannelRepository, ChannelMembersRepository, UsersSeeder],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get(UserRepository);
    channelRepository = module.get(ChannelRepository);
    channelMembersRepository = module.get(ChannelMembersRepository);
    jwtService = module.get(JwtService);
    usersSeeder = module.get(UsersSeeder);

    await app.init();
  });

  afterAll(async () => {
    await userRepository.query('DELETE FROM users');
    await app.close();
  });

  // TODO: figure out how to scope users inside on suitcase
  describe.skip('(GET) /users', () => {
    it('success', async () => {
      const [user1, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);

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
      const [, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user2));

      const { body } = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ email: user2.email }));
    });
    it('should not return password', async () => {
      const [, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user2));

      const { body } = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ email: user2.email }));
      expect(body.password).toBeUndefined();
    });

    it('Unauthorized', async () => {
      await Promise.all([usersSeeder.seedUser(), usersSeeder.seedUser()]);

      await request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });

  describe('(GET) /users/:id', () => {
    it('success', async () => {
      const [user1, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user2));

      const { body } = await request(app.getHttpServer())
        .get(`/users/${user1.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ email: user1.email }));
    });

    it('Unauthorized', async () => {
      await Promise.all([usersSeeder.seedUser(), usersSeeder.seedUser()]);

      await request(app.getHttpServer()).get('/users/id').expect(401);
    });
  });

  describe('(PATCH) /users/me', () => {
    it('success', async () => {
      const [, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user2));

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
      const [, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user2));

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
      const [, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user2));

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
      await Promise.all([usersSeeder.seedUser(), usersSeeder.seedUser()]);
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

  describe('(DELETE) /users/me', () => {
    it('success', async () => {
      const [, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user2));

      const { body } = await request(app.getHttpServer())
        .delete('/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ email: user2.email }));

      const user = await userRepository.findOneBy({ id: user2.id });
      expect(user).toBeFalsy();
    });
    it('should be removed from owner of a channel', async () => {
      const [, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user2));
      const channel = await channelRepository.save(buildChannel(user2));

      const { body } = await request(app.getHttpServer())
        .delete('/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ email: user2.email }));

      const user = await userRepository.findOneBy({ id: user2.id });
      expect(user).toBeFalsy();
      const reloadedChannel = await channelRepository.findOne({
        where: {
          id: channel.id,
        },
      });
      expect(reloadedChannel.owner).toBeFalsy();
    });

    it('should be removed from members of a channel', async () => {
      const [user1, user2] = await Promise.all([
        usersSeeder.seedUser(),
        usersSeeder.seedUser(),
      ]);
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user2));

      const channel = await channelRepository.save(buildChannel(user1));
      await channelMembersRepository.save([
        {
          channelId: channel.id,
          userId: user1.id,
        },
        {
          channelId: channel.id,
          userId: user2.id,
        },
      ]);

      const { body } = await request(app.getHttpServer())
        .delete('/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(expect.objectContaining({ email: user2.email }));

      const user = await userRepository.findOneBy({ id: user2.id });
      expect(user).toBeFalsy();

      const reloadedChannel = await channelRepository.findOne({
        where: {
          id: channel.id,
        },
        relations: {
          members: true,
        },
      });
      expect(reloadedChannel.members).toHaveLength(1);
      expect(reloadedChannel.members).toEqual([
        expect.objectContaining({ userId: user1.id }),
      ]);
    });

    it('Unauthorized', async () => {
      await Promise.all([usersSeeder.seedUser(), usersSeeder.seedUser()]);

      await request(app.getHttpServer()).delete('/users/me').expect(401);
    });
  });
});

function buildChannel(owner: User) {
  const channel = new Channel();
  channel.name = faker.datatype.string(15);
  channel.description = faker.lorem.sentence(5);
  channel.owner = owner;

  return channel;
}
