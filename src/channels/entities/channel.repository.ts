import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PgErrorCodes } from 'src/constants/postgres';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { Channel } from './channel.entity';

@Injectable()
export class ChannelRepository extends Repository<Channel> {
  constructor(dataSource: DataSource) {
    super(Channel, dataSource.createEntityManager());
  }

  async saveChannel(entity: DeepPartial<Channel>) {
    try {
      return await this.save(entity);
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
