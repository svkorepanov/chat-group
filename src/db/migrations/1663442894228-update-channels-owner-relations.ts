import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateChannelsOwnerRelations1663442894228
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE channels ALTER COLUMN "ownerId" DROP NOT NULL;
      ALTER TABLE channels DROP CONSTRAINT "channels_ownerId_fkey";
      ALTER TABLE channels
        ADD CONSTRAINT "channels_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES users (id) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE channels DROP CONSTRAINT "channels_ownerId_fkey";
      ALTER TABLE channels
        ADD CONSTRAINT "channels_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES users (id);
      ALTER TABLE channels ALTER COLUMN "ownerId" SET NOT NULL;
    `);
  }
}
