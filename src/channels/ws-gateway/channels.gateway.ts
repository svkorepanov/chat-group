import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthenticationService } from '../../authentication/authentication.service';
import { JwtWsAuthGuard } from '../../authentication/guards/jwt-ws-auth.guard';

@UseGuards(JwtWsAuthGuard)
@WebSocketGateway({
  transports: ['websocket'],
})
export class ChannelsGateway
  implements OnGatewayConnection<Socket>, OnGatewayInit<Server>
{
  @WebSocketServer()
  io: Server;

  constructor(private authService: AuthenticationService) {}

  handleConnection(socket: Socket) {
    console.log(`Connected: ${socket.id}`);
  }

  afterInit(server: Server) {
    server.use(this.authService.getWsAuthMiddleware());
  }

  @SubscribeMessage('send-message')
  handleNewMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log('/////new message/////');
    console.log(socket);
    // console.log(socket.handshake);
    // // console.log(socket.handshake.headers.authorization);
    // console.log(data);
    // this.io.emit('receive-message', data);
  }
}
