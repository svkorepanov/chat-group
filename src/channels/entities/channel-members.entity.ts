import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Channel } from './channel.entity';

@Entity('channelMembers')
export class ChannelMembers {
  @PrimaryColumn({ type: 'int4' })
  userId: number;

  @PrimaryColumn({ type: 'int4' })
  channelId: number;

  @ManyToOne(() => Channel, (channel) => channel.members, {
    cascade: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'channelId', referencedColumnName: 'id' })
  channel: Channel;

  @ManyToOne(() => User, (user) => user.memberOfChannels, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  member: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date;

  @VersionColumn({ default: 0, nullable: true })
  version: number;
}
