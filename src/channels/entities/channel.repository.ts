import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { PgErrorCodes } from '../../constants/postgres';
import { Channel } from './channel.entity';

@Injectable()
export class ChannelRepository extends Repository<Channel> {
  constructor(dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }

  async saveChannel(entity: DeepPartial<Channel>, transaction?: EntityManager) {
    try {
      const channel = this.create(entity);
      if (transaction) {
        return await transaction.save(channel);
      }
      return await this.save(channel);
    } catch (error) {
      if (error?.code === PgErrorCodes.UniqueViolation) {
        throw new ConflictException(
          `Channel with name '${entity.name}' alread exists`,
        );
      }
      throw new InternalServerErrorException();
    }
  }
}
