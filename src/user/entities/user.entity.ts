import {
  Column,
  Entity,
  JoinTable,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  PrimaryColumn,
  ManyToOne,
} from 'typeorm';
import { Board } from '../../board/entities/board.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Card } from '../../card/entities/card.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { UserCard } from '../../user_cards/user_cards.entity';

@Entity()
export class User {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  email: string;

  @Column('text')
  photoUrl: string;

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Board, (board) => board.owner)
  ownedBoards: Board[];

  @ManyToMany(() => Board, (board) => board.members, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'board_members', // table name for the junction table of this relation
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'board_id', referencedColumnName: 'id' },
  })
  joinedBoards: Board[];

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => UserCard, (userCard) => userCard.card, {
    onDelete: 'CASCADE',
  })
  cards: UserCard[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  notifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.sender, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  sentNotifications: Notification[];
}
