import {
  ClassSerializerInterceptor,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthenticationService } from '../../authentication/authentication.service';
import { JwtWsAuthGuard } from '../../authentication/guards/jwt-ws-auth.guard';
import { UsersService } from '../../user/users.service';
import { ChannelsService } from '../channels.service';
import { CreateChannelMessageDto } from '../dto/create-channel-message.dto';
import {
  ChannelServer,
  ChannelSocket,
  EmitEvents,
} from '../interfaces/socket.interface';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(JwtWsAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
  transports: ['websocket'],
})
export class ChannelsGateway
  implements OnGatewayConnection<Socket>, OnGatewayInit<Server>
{
  @WebSocketServer()
  io: ChannelServer;

  constructor(
    private authService: AuthenticationService,
    private usersService: UsersService,
    private channelsService: ChannelsService,
  ) {}

  async handleConnection(socket: ChannelSocket) {
    console.log(`Connected: ${socket.id}`);
    const { user } = socket.data;
    // find all channels and join to its rooms
    const userChannels = await this.usersService.findUserChannels(user.id);
    socket.data.channels = userChannels.map(({ channelId }) =>
      String(channelId),
    );
    socket.join(socket.data.channels);
  }

  afterInit(server: Server) {
    server.use(this.authService.getWsAuthMiddleware());
  }

  @SubscribeMessage('send-message')
  async createMessage(
    @MessageBody() createMessageDto: CreateChannelMessageDto,
    @ConnectedSocket() socket: ChannelSocket,
  ) {
    const { user } = socket.data;
    try {
      const message = await this.channelsService.createMessage(
        createMessageDto,
        user.id,
      );

      socket
        .to(String(message.channel.id))
        .emit(EmitEvents.receiveMessage, message);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new WsException(error.message);
      }
      throw new WsException('Server error');
    }
  }
}
