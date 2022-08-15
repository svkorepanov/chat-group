import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, length: 240 })
  bio: string;

  @Column({ nullable: true, length: 11 })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;
}
