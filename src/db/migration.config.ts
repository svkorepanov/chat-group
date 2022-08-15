import { DataSource } from 'typeorm';

// tep
export default new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST ?? 'localhost',
  port: parseInt(process.env.PG_PORT ?? '35000', 10),
  username: process.env.PG_USER ?? 'user',
  password: process.env.PG_PASSWORD ?? 'password',
  database: process.env.PG_DB ?? 'db',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
});
