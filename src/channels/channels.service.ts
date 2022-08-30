import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelMembersRepository } from './entities/channel-members.repository';
import { Channel } from './entities/channel.entity';
import { ChannelRepository } from './entities/channel.repository';

@Injectable()
export class ChannelsService {
  constructor(
    private channelRepository: ChannelRepository,
    private channelMembersRepository: ChannelMembersRepository,
  ) {}

  async findAll(): Promise<Channel[]> {
    return await this.channelRepository.find({ relations: { owner: true } });
  }

  async findOne(id: number, withMembers = false): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      relations: { owner: true, members: withMembers },
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with id '${id}' is not found`);
    }

    return channel;
  }

  async join(id: number, user: User): Promise<void> {
    await this.channelMembersRepository.save({
      userId: user.id,
      channelId: id,
    });
  }

  async leave(id: number, user: User): Promise<void> {
    await this.channelMembersRepository.softRemove({
      userId: user.id,
      channelId: id,
    });
  }

  async create(
    owner: User,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const newChannel = this.channelRepository.create({
      ...createChannelDto,
      owner,
    });

    const newChannelInstance = await this.channelRepository.saveChannel(
      newChannel,
    );
    await this.channelMembersRepository.save({
      channelId: newChannelInstance.id,
      userId: owner.id,
    });

    return newChannelInstance;
  }

  async update(
    id: number,
    updateChannelDto: UpdateChannelDto,
    user: User,
  ): Promise<Channel> {
    const channel = await this.findOne(id);
    if (channel.owner.id !== user.id) {
      throw new ForbiddenException();
    }
    const newChannel = this.channelRepository.merge(channel, updateChannelDto);
    return await this.channelRepository.saveChannel(newChannel);
  }

  async remove(id: number, user: User): Promise<Channel> {
    const channel = await this.findOne(id);
    if (channel.owner.id !== user.id) {
      throw new ForbiddenException();
    }

    return this.channelRepository.softRemove(channel);
  }
}
