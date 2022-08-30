import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelRepository } from './entities/channel.repository';
import { ChannelMembers } from './entities/channel-members.entity';
import { ChannelMembersRepository } from './entities/channel-members.repository';
import { MessagesModule } from '../messages/messages.module';
import { ChannelsGateway } from './channels.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelMembers]),
    MessagesModule,
  ],
  controllers: [ChannelsController],
  providers: [
    ChannelsService,
    ChannelRepository,
    ChannelMembersRepository,
    ChannelsGateway,
  ],
})
export class ChannelsModule {}
