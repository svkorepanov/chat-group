import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ChannelMembers } from './channel-members.entity';

@Injectable()
export class ChannelMembersRepository extends Repository<ChannelMembers> {
  constructor(dataSource: DataSource) {
    super(ChannelMembers, dataSource.createEntityManager());
  }
}
