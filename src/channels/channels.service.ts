import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PgErrorCodes } from '../constants/postgres';
import { MessagesService } from '../messages/messages.service';
import { User } from '../user/entities/user.entity';
import { CreateChannelMessageDto } from './dto/create-channel-message.dto';
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
    private messagesService: MessagesService,
    private dataSource: DataSource,
  ) {}

  private readonly logger = new Logger(ChannelsService.name);

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
    const channel = await this.findOne(id);
    await this.channelMembersRepository.save({
      userId: user.id,
      channelId: channel.id,
    });
    this.logger.log(`User ${user.id} has joined channel ${id}`);
  }

  async leave(id: number, user: User): Promise<void> {
    const channel = await this.findOne(id);
    await this.channelMembersRepository.softRemove({
      userId: user.id,
      channelId: channel.id,
    });
    this.logger.log(`User ${user.id} has left channel ${id}`);
  }

  async create(
    owner: User,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const newChannel = this.channelRepository.create({
      ...createChannelDto,
      owner,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newChannelInstance = await this.channelRepository.saveChannel(
        newChannel,
        queryRunner.manager,
      );
      const channelMemebers = this.channelMembersRepository.create({
        channelId: newChannelInstance.id,
        userId: owner.id,
      });
      await queryRunner.manager.save(channelMemebers);
      await queryRunner.commitTransaction();

      this.logger.log(
        `User ${owner.id} has created the channel ${newChannelInstance.id}`,
      );

      return newChannelInstance;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async createMessage(
    createMessageDto: CreateChannelMessageDto,
    userId: number,
  ) {
    const { channelId } = createMessageDto;
    const channel = await this.channelRepository.findOne({
      where: {
        id: channelId,
        members: { userId },
      },
      relations: {
        members: true,
      },
    });

    if (!channel) {
      throw new NotFoundException(`There is no channel with id :${channelId}`);
    }

    return await this.messagesService.create(createMessageDto, userId);
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
    try {
      const savedChannel = await this.channelRepository.saveChannel(newChannel);
      return savedChannel;
    } catch (error) {
      if (error?.code === PgErrorCodes.UniqueViolation) {
        throw new ConflictException(
          `Channel with name '${newChannel.name}' alread exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: number, user: User): Promise<Channel> {
    const channel = await this.findOne(id, true);
    if (channel.owner.id !== user.id) {
      throw new ForbiddenException();
    }

    return this.channelRepository.softRemove(channel);
  }
}
