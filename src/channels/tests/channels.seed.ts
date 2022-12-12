import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UsersSeeder } from '../../user/tests/users.seed';
import { Channel } from '../entities/channel.entity';
import { ChannelMembersSeeder } from './channel-members.seed';

@Injectable()
export class ChannelsSeeder {
  private entityManager: EntityManager;

  constructor(
    dataSource: DataSource,
    private usersSeeder: UsersSeeder,
    private channelMembersSeeder: ChannelMembersSeeder,
  ) {
    this.entityManager = dataSource.createEntityManager();
  }

  public async seedChannel(overrides?: Partial<Channel>) {
    const channel = await this.entityManager.save(this.buildChannel(overrides));
    await this.channelMembersSeeder.seedChannelMember({
      channelId: channel.id,
      userId: channel.owner.id,
    });
    return channel;
  }

  public buildChannel(overrides: Partial<Channel> = {}): Channel {
    if (!overrides.owner) {
      overrides.owner = this.usersSeeder.buildUser();
    }
    return this.entityManager.create<Channel>(Channel, {
      name: faker.random.words(2),
      ...overrides,
    });
  }
}
