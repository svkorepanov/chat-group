import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { JwtPayload } from '../../authentication/dto/jwt.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersSeeder {
  private entityManager: EntityManager;

  constructor(dataSource: DataSource) {
    this.entityManager = dataSource.createEntityManager();
  }

  public async seedUser(ovverrides?: Partial<User>) {
    const user = await this.entityManager.save(this.buildUser(ovverrides));

    return user;
  }

  public buildUser(ovverrides?: Partial<User>): User {
    return this.entityManager.create<User>(User, {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.name.firstName(),
      bio: faker.lorem.sentence(10),
      phone: faker.phone.number('###########'),
      ...ovverrides,
    });
  }

  public buildJwtPayload(user: User): JwtPayload {
    return { username: user.name, sub: user.id };
  }
}
