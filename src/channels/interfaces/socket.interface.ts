import { Socket } from 'socket.io';
import { User } from '../../user/entities/user.entity';
import { Message } from '../../messages/entities/message.entity';

export enum EmitEvents {
  receiveMessage = 'receive-message',
}

interface ServerToClientEvents {
  [EmitEvents.receiveMessage]: (message: Message) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface SocketData {
  user: User;
  channels: string[];
}

export type ChannelSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  any,
  SocketData
>;

export type ChannelServer = Socket<
  ServerToClientEvents,
  ClientToServerEvents,
  any,
  SocketData
>;
