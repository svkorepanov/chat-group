import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersSeeder } from '../../user/tests/users.seed';
import { ChannelsModule } from '../channels.module';
import { ChannelsSeeder } from './channels.seed';
import * as request from 'supertest';
import { DataBaseModule } from '../../db/db.module';
import { JwtService } from '@nestjs/jwt';
import { ChannelMembersSeeder } from './channel-members.seed';
import { faker } from '@faker-js/faker';
import { ChannelRepository } from '../entities/channel.repository';
import { ChannelMembersRepository } from '../entities/channel-members.repository';
import { MessageSeeder } from './message.seed';

describe('ChannelsModule (e2e)', () => {
  let app: INestApplication;
  let channelSeeder: ChannelsSeeder;
  let jwtService: JwtService;
  let usersSeeder: UsersSeeder;
  let channelRepository: ChannelRepository;
  let channelMembersRepository: ChannelMembersRepository;
  let channelMembersSeeder: ChannelMembersSeeder;
  let messageSeeder: MessageSeeder;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ChannelsModule, DataBaseModule],
      providers: [
        ChannelsSeeder,
        UsersSeeder,
        ChannelMembersSeeder,
        ChannelRepository,
        ChannelMembersRepository,
        MessageSeeder,
      ],
    }).compile();

    app = module.createNestApplication();
    channelSeeder = module.get(ChannelsSeeder);
    jwtService = module.get(JwtService);
    usersSeeder = module.get(UsersSeeder);
    channelMembersSeeder = module.get(ChannelMembersSeeder);
    channelRepository = module.get(ChannelRepository);
    channelMembersRepository = module.get(ChannelMembersRepository);
    messageSeeder = module.get(MessageSeeder);

    await app.init();
  });

  afterAll(async () => {
    app.close();
  });

  describe.skip('(GET) /channels', () => {
    it('success', async () => {
      const channel = await channelSeeder.seedChannel();
      const jwtToken = jwtService.sign(
        usersSeeder.buildJwtPayload(channel.owner),
      );

      const { body } = await request(app.getHttpServer())
        .get('/channels')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body.length).toBeGreaterThan(0);
    });
  });

  describe('(GET) /channels/:id', () => {
    it('success', async () => {
      const channel = await channelSeeder.seedChannel();
      const jwtToken = jwtService.sign(
        usersSeeder.buildJwtPayload(channel.owner),
      );

      const { body } = await request(app.getHttpServer())
        .get(`/channels/${channel.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toEqual(
        expect.objectContaining({
          id: channel.id,
          owner: expect.objectContaining({
            id: channel.owner.id,
          }),
          members: expect.arrayContaining([
            expect.objectContaining({
              userId: channel.owner.id,
            }),
          ]),
        }),
      );
    });
    it('path param validation', async () => {
      const channel = await channelSeeder.seedChannel();
      const jwtToken = jwtService.sign(
        usersSeeder.buildJwtPayload(channel.owner),
      );

      await request(app.getHttpServer())
        .get(`/channels/12zz`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });
    it('not found', async () => {
      const channel = await channelSeeder.seedChannel();
      const jwtToken = jwtService.sign(
        usersSeeder.buildJwtPayload(channel.owner),
      );

      await request(app.getHttpServer())
        .get(`/channels/9999999`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
    it('Unauthorized', async () => {
      const channel = await channelSeeder.seedChannel();

      await request(app.getHttpServer())
        .get(`/channels/${channel.id}`)
        .expect(401);
    });
  });

  describe('(POST) /channels', () => {
    it('success', async () => {
      const user = await usersSeeder.seedUser();
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user));

      const { body } = await request(app.getHttpServer())
        .post('/channels')
        .send({ name: faker.random.words(2) })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(201);

      const channel = await channelRepository.findOne({
        where: {
          id: body.id,
        },
        relations: {
          members: true,
        },
      });

      expect(channel).toBeDefined();
      expect(channel.members).toEqual([
        expect.objectContaining({
          userId: user.id,
        }),
      ]);
      expect(body).toEqual(
        expect.objectContaining({
          id: channel.id,
          owner: expect.objectContaining({
            id: user.id,
          }),
        }),
      );
    });
    it('validation error when the name is not passed', async () => {
      const user = await usersSeeder.seedUser();
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user));

      await request(app.getHttpServer())
        .post('/channels')
        .send({ desciption: faker.random.words(2) })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });
    it('Unauthorised', async () => {
      await request(app.getHttpServer())
        .post('/channels')
        .send({ name: faker.random.words(2) })
        .expect(401);
    });
  });

  describe('(POST) /channels/:id/join', () => {
    it('success', async () => {
      const user = await usersSeeder.seedUser();
      const channel = await channelSeeder.seedChannel();
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user));

      await request(app.getHttpServer())
        .post(`/channels/${channel.id}/join`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(204);

      const channelReloaded = await channelRepository.findOne({
        where: {
          id: channel.id,
        },
        relations: {
          members: true,
        },
      });
      expect(channelReloaded.members).toHaveLength(2);
      expect(channelReloaded.members).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: user.id,
            channelId: channel.id,
          }),
          expect.objectContaining({
            userId: channel.owner.id,
            channelId: channel.id,
          }),
        ]),
      );
    });

    it('Not found', async () => {
      const user = await usersSeeder.seedUser();
      await channelSeeder.seedChannel();
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user));

      await request(app.getHttpServer())
        .post(`/channels/9999999/join`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });

    it('Unauthorized', async () => {
      const channel = await channelSeeder.seedChannel();

      await request(app.getHttpServer())
        .post(`/channels/${channel.id}/join`)
        .expect(401);
    });
  });

  describe('(POST) /channels/:id/leave', () => {
    it('success', async () => {
      const user = await usersSeeder.seedUser();
      const channel = await channelSeeder.seedChannel();
      await channelMembersSeeder.seedChannelMember({
        channelId: channel.id,
        userId: user.id,
      });
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user));
      const channelBefore = await channelRepository.findOne({
        where: {
          id: channel.id,
        },
        relations: {
          members: true,
        },
      });

      await request(app.getHttpServer())
        .post(`/channels/${channel.id}/leave`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(204);

      const channelAfter = await channelRepository.findOne({
        where: {
          id: channel.id,
        },
        relations: {
          members: true,
        },
      });
      expect(channelBefore.members).toHaveLength(2);
      expect(channelAfter.members).toHaveLength(1);
      expect(channelAfter.members).toEqual([
        expect.objectContaining({
          userId: channel.owner.id,
          channelId: channel.id,
        }),
      ]);
    });

    it('Not found', async () => {
      const user = await usersSeeder.seedUser();
      await channelSeeder.seedChannel();
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user));

      await request(app.getHttpServer())
        .post(`/channels/9999999/leave`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });

    it('Unauthorized', async () => {
      const channel = await channelSeeder.seedChannel();

      await request(app.getHttpServer())
        .post(`/channels/${channel.id}/leave`)
        .expect(401);
    });
  });

  describe('(PATCH) /channels/:id', () => {
    it('success', async () => {
      const user = await usersSeeder.seedUser();
      const channel = await channelSeeder.seedChannel({
        name: faker.random.words(2),
        description: faker.random.words(2),
      });
      await channelMembersSeeder.seedChannelMember({
        channelId: channel.id,
        userId: user.id,
      });
      const jwtToken = jwtService.sign(
        usersSeeder.buildJwtPayload(channel.owner),
      );

      const newName = faker.random.words(2);
      const newDescription = faker.random.words(2);
      await request(app.getHttpServer())
        .patch(`/channels/${channel.id}`)
        .send({ name: newName, description: newDescription })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const channelAfter = await channelRepository.findOne({
        where: {
          id: channel.id,
        },
      });
      expect(channelAfter.name).toEqual(newName);
      expect(channelAfter.description).toEqual(newDescription);
    });

    it('should throw validation error when excessive properties are passed', async () => {
      const channel = await channelSeeder.seedChannel({
        name: faker.random.words(2),
      });
      const jwtToken = jwtService.sign(
        usersSeeder.buildJwtPayload(channel.owner),
      );

      await request(app.getHttpServer())
        .patch(`/channels/${channel.id}`)
        .send({ name: 'updated name', id: 123 })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400);
    });

    it('should throw an error when the updated name already exists', async () => {
      const channel1 = await channelSeeder.seedChannel({
        name: faker.random.words(2),
      });
      const channel2 = await channelSeeder.seedChannel({
        name: faker.random.words(2),
      });
      const jwtToken = jwtService.sign(
        usersSeeder.buildJwtPayload(channel2.owner),
      );

      await request(app.getHttpServer())
        .patch(`/channels/${channel2.id}`)
        .send({ name: channel1.name })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(409);
    });

    it('should throw forbiden when the user is not the owner', async () => {
      const user = await usersSeeder.seedUser();
      const channel = await channelSeeder.seedChannel();
      await channelMembersSeeder.seedChannelMember({
        channelId: channel.id,
        userId: user.id,
      });
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user));

      await request(app.getHttpServer())
        .patch(`/channels/${channel.id}`)
        .send({ name: 'name from the user' })
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(403);
    });

    it('Unauthorized without token', async () => {
      const channel = await channelSeeder.seedChannel();

      await request(app.getHttpServer())
        .patch(`/channels/${channel.id}`)
        .expect(401);
    });
  });

  describe('(DELETE) /channels/:id', () => {
    it('success', async () => {
      const user = await usersSeeder.seedUser();
      const channel = await channelSeeder.seedChannel();
      await channelMembersSeeder.seedChannelMember({
        channelId: channel.id,
        userId: user.id,
      });
      const jwtToken = jwtService.sign(
        usersSeeder.buildJwtPayload(channel.owner),
      );

      await request(app.getHttpServer())
        .delete(`/channels/${channel.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const channelAfter = await channelRepository.findOne({
        where: {
          id: channel.id,
        },
      });
      const channelMembers = await channelMembersRepository.find({
        where: {
          channelId: channel.id,
        },
      });
      expect(channelAfter).toBeNull();
      expect(channelMembers).toHaveLength(0);
    });

    it('should throw forbiden when the actor is not the owner', async () => {
      const user = await usersSeeder.seedUser();
      const channel = await channelSeeder.seedChannel();
      await channelMembersSeeder.seedChannelMember({
        channelId: channel.id,
        userId: user.id,
      });
      const jwtToken = jwtService.sign(usersSeeder.buildJwtPayload(user));

      await request(app.getHttpServer())
        .delete(`/channels/${channel.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(403);
    });

    it('Unauthorized without token', async () => {
      const channel = await channelSeeder.seedChannel();

      await request(app.getHttpServer())
        .delete(`/channels/${channel.id}`)
        .expect(401);
    });
  });

  describe('(GET) /channels/:id/messages', () => {
    it('success', async () => {
      const user = await usersSeeder.seedUser();
      const channel = await channelSeeder.seedChannel();
      await channelMembersSeeder.seedChannelMember({
        channelId: channel.id,
        userId: user.id,
      });
      await messageSeeder.seedChannelMessage({
        channelId: channel.id,
        userId: channel.owner.id,
      });
      await messageSeeder.seedChannelMessage({
        channelId: channel.id,
        userId: user.id,
      });
      const jwtToken = jwtService.sign(
        usersSeeder.buildJwtPayload(channel.owner),
      );

      const { body } = await request(app.getHttpServer())
        .get(`/channels/${channel.id}/messages`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(body).toHaveLength(2);
    });

    it('Unauthorized without token', async () => {
      const channel = await channelSeeder.seedChannel();

      await request(app.getHttpServer())
        .get(`/channels/${channel.id}/messages`)
        .expect(401);
    });
  });
});
