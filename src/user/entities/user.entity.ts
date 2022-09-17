import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ChannelMembers } from '../../channels/entities/channel-members.entity';
import { Channel } from '../../channels/entities/channel.entity';

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

  @OneToMany(() => Channel, (channel) => channel.owner, {
    cascade: ['insert', 'update'],
    onDelete: 'SET NULL',
  })
  ownerOfChannels: Channel[];

  @OneToMany(() => ChannelMembers, (channelMembers) => channelMembers.member, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  memberOfChannels: ChannelMembers[];
}
