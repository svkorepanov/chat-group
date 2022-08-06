import { DataSource } from 'typeorm';
import { User } from './user.entity';

export const getUserRepository = (dataSource: DataSource) =>
  dataSource.getRepository(User).extend({});
