import { Exclude } from 'class-transformer';
import { Message } from '../../messages/entities/message.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ChannelMembers } from './channel-members.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'channels' })
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 240 })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn({ default: 0, nullable: true })
  version: number;

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.ownerOfChannels, {
    cascade: ['insert', 'update'],
    nullable: true,
  })
  @JoinColumn({ name: 'ownerId', referencedColumnName: 'id' })
  owner: User;

  @OneToMany(() => ChannelMembers, (channelMembers) => channelMembers.channel)
  members: ChannelMembers[];

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];
}
