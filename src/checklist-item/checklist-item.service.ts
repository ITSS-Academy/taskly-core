import { Injectable } from '@nestjs/common';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChecklistItem } from './entities/checklist-item.entity';
import { Repository } from 'typeorm';
import { Card } from '../card/entities/card.entity';

@Injectable()
export class ChecklistItemService {
  constructor(
    @InjectRepository(ChecklistItem)
    private checklistItemRepository: Repository<ChecklistItem>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  async create(createChecklistItemDto: CreateChecklistItemDto) {
    const card = await this.cardRepository.findOne({
      where: { id: createChecklistItemDto.cardId },
    });
    console.log(card);
    if (!card) {
      throw new Error('Card not found');
    }

    const checklistItem = this.checklistItemRepository.create({
      title: createChecklistItemDto.title,
      position: createChecklistItemDto.position,
      is_completed: createChecklistItemDto.is_completed,
      card: card,
    });

    return this.checklistItemRepository.save(checklistItem);
  }

  findAll() {
    return `This action returns all checklistItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} checklistItem`;
  }

  update(id: number, updateChecklistItemDto: UpdateChecklistItemDto) {
    return `This action updates a #${id} checklistItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} checklistItem`;
  }
}
