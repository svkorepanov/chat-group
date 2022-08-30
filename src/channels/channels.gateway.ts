import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  transports: ['websocket'],
})
export class ChannelsGateway implements OnGatewayConnection<Socket> {
  @WebSocketServer()
  io: Server;

  handleConnection(socket: Socket) {
    console.log(socket.handshake);
  }

  @SubscribeMessage('send-message')
  handleNewMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('/////new message/////');
    console.log(socket.id);
    console.log(data);
    socket.emit('receive-message', data);
  }
}
