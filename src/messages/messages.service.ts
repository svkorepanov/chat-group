import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { MessageRepository } from './entities/message.repository';

@Injectable()
export class MessagesService {
  constructor(private messageRepository: MessageRepository) {}

  async create(
    createMessageDto: CreateMessageDto,
    userId: number,
  ): Promise<Message> {
    const { text, channelId } = createMessageDto;
    const newMessage = this.messageRepository.create({
      text,
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

  update(id: number) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
