import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Card } from '../../card/entities/card.entity';

@Entity()
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('text')
  title: string;

  @ManyToOne(() => Card, (card) => card.checklistItems, { onDelete: 'CASCADE' })
  card: Card;

  @Column('int4')
  position: number;

  @Column('boolean')
  is_completed: boolean;

  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
