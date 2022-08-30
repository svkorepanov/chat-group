import { MigrationInterface, QueryRunner } from 'typeorm';

export class createChanels1660661534987 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "channels" (
        "id" serial PRIMARY KEY,
        "name" varchar(50) NOT NULL UNIQUE,
        "description" varchar(240),
        "ownerId" integer NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "version" INTEGER DEFAULT 0 NOT NULL,
        FOREIGN KEY ("ownerId") REFERENCES "users" ("id")
      );

      CREATE TABLE "channelMembers" (
        "userId" integer,
        "channelId" integer,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT now() NOT NULL,
        "deletedAt" TIMESTAMP,
        "version" INTEGER DEFAULT 0 NOT NULL,
        PRIMARY KEY ("userId", "channelId"),
        FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("channelId") REFERENCES "channels" ("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      DROP TABLE "chanelMembers";

      DROP TABLE "channels";
    `);
  }
}
