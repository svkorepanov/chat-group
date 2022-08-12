import { DataSource, DataSourceOptions } from 'typeorm';

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 35000,
  username: 'user',
  password: 'password',
  database: 'db',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  synchronize: true,
};

export default new DataSource({
  ...typeormConfig,
});
