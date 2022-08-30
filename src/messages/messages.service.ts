import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { MessageRepository } from './entities/message.repository';

@Injectable()
export class MessagesService {
  constructor(private messageRepository: MessageRepository) {}

  async create(
    createMessageDto: CreateMessageDto,
    channelId: number,
    userId: number,
  ): Promise<Message> {
    const newMessage = this.messageRepository.create({
      ...createMessageDto,
      channel: { id: channelId },
      user: { id: userId },
    });
    return await this.messageRepository.save(newMessage);
  }

  async findAll(channelId: number) {
    return await this.messageRepository.find({
      where: { channel: { id: channelId } },
      relations: { user: true },
      select: { user: { id: true, name: true } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
