import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsers1660581485815 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE users (
          id serial PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR NOT NULL,
          name VARCHAR(100) NOT NULL,

          bio VARCHAR(240),
          phone VARCHAR(11),

          createdAt TIMESTAMP NOT NULL,
          updatedAt TIMESTAMP NOT NULL,
          deletedAt TIMESTAMP,

          version INTEGER DEFAULT 0 NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      DROP TABLE users;
    `);
  }
}
