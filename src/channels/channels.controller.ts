import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ClassSerializerInterceptor,
  UseInterceptors,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { GetUser } from '../authentication/decorators/user-request.decorator';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Message } from '../messages/entities/message.entity';
import { MessagesService } from '../messages/messages.service';
import { User } from '../user/entities/user.entity';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Controller('channels')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private messagesService: MessagesService,
  ) {}

  @Get()
  async findAll(): Promise<Channel[]> {
    return await this.channelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.channelsService.findOne(id, true);
  }

  @Post()
  create(@Body() createChannelDto: CreateChannelDto, @GetUser() user: User) {
    return this.channelsService.create(user, createChannelDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':id/join')
  joinChannel(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.channelsService.join(id, user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':id/leave')
  leaveChannel(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.channelsService.leave(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChannelDto: UpdateChannelDto,
    @GetUser() user: User,
  ) {
    return this.channelsService.update(id, updateChannelDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.channelsService.remove(id, user);
  }

  @Get(':id/messages')
  async findAllMessages(
    @Param('id', ParseIntPipe) channelId: number,
  ): Promise<Message[]> {
    return await this.messagesService.findAll(channelId);
  }
}
