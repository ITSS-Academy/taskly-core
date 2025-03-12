import {
  Column,
  Entity,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinTable,
} from 'typeorm';
import { timestamp } from 'rxjs';
import { User } from '../../user/entities/user.entity';
import { List } from '../../list/entities/list.entity';
import { PrimaryColumn } from 'typeorm';
import { BoardLabel } from '../../board_label/entities/board_label.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Background } from '../../background/entities/background.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('timestamptz')
  createdAt: Date;

  @OneToMany(() => List, (task) => task.board, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  lists: List[];

  @ManyToOne(() => User, (user) => user.ownedBoards, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  owner: User;

  @OneToMany(() => BoardLabel, (boardLabel) => boardLabel.board, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  labels: BoardLabel[];

  @ManyToMany(() => User, (user) => user.joinedBoards, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  members: User[];

  @OneToMany(() => Notification, (notification) => notification.board, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  notifications: Notification[];

  @ManyToOne(() => Background)
  background: Background;
}
