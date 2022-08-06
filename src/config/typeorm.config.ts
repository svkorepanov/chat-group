import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 35000,
  username: 'user',
  password: 'password',
  database: 'db',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
