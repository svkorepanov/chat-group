import { MigrationInterface, QueryRunner } from 'typeorm';

export class createMessages1661366329143 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    return await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" serial PRIMARY KEY,
        "text" text NOT NULL,
        "userId" integer NOT NULL,
        "channelId" integer NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "version" INTEGER DEFAULT 0 NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users" ("id"),
        FOREIGN KEY ("channelId") REFERENCES "channels" ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return await queryRunner.query(`
      DROP TABLE "messages";
    `);
  }
}
