import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ChannelMembers } from '../entities/channel-members.entity';

@Injectable()
export class ChannelMembersSeeder {
  private entityManager: EntityManager;

  constructor(dataSource: DataSource) {
    this.entityManager = dataSource.createEntityManager();
  }

  public async seedChannelMember(
    params: Pick<ChannelMembers, 'channelId' | 'userId'>,
  ) {
    const channelMember = await this.entityManager.save(
      this.buildChannelMember(params),
    );

    return channelMember;
  }

  public buildChannelMember(
    params: Partial<ChannelMembers> = {},
  ): ChannelMembers {
    return this.entityManager.create<ChannelMembers>(ChannelMembers, params);
  }
}
