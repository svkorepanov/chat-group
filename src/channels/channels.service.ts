import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';
import { ChannelRepository } from './entities/channel.repository';

@Injectable()
export class ChannelsService {
  constructor(private channelRepository: ChannelRepository) {}

  async create(
    user: User,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const newChannel = this.channelRepository.create({
      ...createChannelDto,
      owner: user,
    });

    return await this.channelRepository.saveChannel(newChannel);
  }

  async findAll(): Promise<Channel[]> {
    return await this.channelRepository.find({ relations: { owner: true } });
  }

  async findOne(id: number): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      relations: { owner: true },
      where: { id },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with id '${id}' is not found`);
    }

    return channel;
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
