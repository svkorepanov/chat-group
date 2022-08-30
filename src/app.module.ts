import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule } from './config/config.module';
import { DataBaseModule } from './db/db.module';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    DataBaseModule,
    UsersModule,
    AuthenticationModule,
    ConfigModule,
    ChannelsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
