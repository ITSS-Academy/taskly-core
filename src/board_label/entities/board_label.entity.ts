import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from '../../board/entities/board.entity';
import { Card } from '../../card/entities/card.entity';

@Entity()
export class BoardLabel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Board, (board) => board.labels, {
    onDelete: 'CASCADE',
  })
  board: Board;

  @Column('text')
  name: string;

  @Column('text')
  color: string;

  @ManyToMany(() => Card, (card) => card.labels, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'labels_cards',
  })
  cards: Card[];
}
