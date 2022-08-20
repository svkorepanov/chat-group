import { Exclude } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

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
    onDelete: 'NO ACTION',
    nullable: false,
  })
  @JoinColumn({ name: 'ownerId', referencedColumnName: 'id' })
  owner: User;

  @ManyToMany(() => User, (user) => user.memberOfChannels, {
    cascade: ['insert', 'update'],
    onDelete: 'NO ACTION',
  })
  @JoinTable({
    name: 'channelMembers',
    joinColumn: {
      name: 'channelId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  members: User[];
}
