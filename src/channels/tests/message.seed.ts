import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Message } from '../../messages/entities/message.entity';

interface SeedMessageParams {
  text?: string;
  channelId: number;
  userId: number;
}

@Injectable()
export class MessageSeeder {
  private entityManager: EntityManager;

  constructor(dataSource: DataSource) {
    this.entityManager = dataSource.createEntityManager();
  }

  public async seedChannelMessage(overrides: SeedMessageParams) {
    const message = await this.entityManager.save(this.buildMessage(overrides));

    return message;
  }

  public buildMessage(overrides: SeedMessageParams): Message {
    if (!overrides.text) {
      overrides.text = faker.lorem.sentence();
    }
    return this.entityManager.create<Message>(Message, {
      text: faker.lorem.sentence(),
      user: { id: overrides.userId },
      channel: { id: overrides.channelId },
    });
  }
}
