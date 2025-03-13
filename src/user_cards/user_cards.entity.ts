import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  PrimaryColumn,
  Column,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Card } from '../card/entities/card.entity';

@Entity('user_cards') // Tên bảng trong DB
export class UserCard {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  card_id: string;

  @ManyToOne(() => User, (user) => user.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Card, (card) => card.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
