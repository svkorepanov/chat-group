import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('PG_HOST'),
        port: configService.get('PG_PORT'),
        username: configService.get('PG_USER'),
        password: configService.get('PG_PASSWORD'),
        database: configService.get('PG_DB'),
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        migrations: [__dirname + '/migrations/*.{js,ts}'],
        synchronize: configService.get('PG_SYNC'),
        logging: ['error', 'warn'],
      }),
    }),
  ],
})
export class DataBaseModule {}
