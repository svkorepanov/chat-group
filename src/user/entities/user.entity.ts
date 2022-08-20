import { Exclude } from 'class-transformer';
import { Channel } from 'src/channels/entities/channel.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 240 })
  bio: string;

  @Column({ nullable: true, length: 11 })
  phone: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn({ default: 0, nullable: true })
  version: number;

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Channel, (channel) => channel.owner, { onDelete: 'CASCADE' })
  ownerOfChannels: Channel[];

  @ManyToMany(() => Channel, (channel) => channel.members, {
    onDelete: 'NO ACTION',
  })
  memberOfChannels: Channel[];
}
