import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChecklistItem } from './entities/checklist-item.entity';
import { Repository } from 'typeorm';
import { Card } from '../card/entities/card.entity';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ChecklistItemService {
  constructor(
    @InjectRepository(ChecklistItem)
    private checklistItemRepository: Repository<ChecklistItem>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private supabase: SupabaseService,
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
      position: card.position + 1,
      is_completed: createChecklistItemDto.isCompleted,
      card: card,
    });

    let checklistData: any =
      await this.checklistItemRepository.save(checklistItem);

    checklistData.cardId = checklistData.card.id;
    delete checklistData.card;
    checklistData.isCompleted = checklistData.is_completed;
    return checklistData;
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

  async remove(id: string) {
    const { data, error } = await this.supabase.supabase
      .from('checklist_item')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async toogleChecklistItem(id: string, isCompleted: boolean) {
    //get checklist item, update is_completed by promise.all
    const promises = [
      this.supabase.supabase
        .from('checklist_item')
        .update({ is_completed: !isCompleted })
        .eq('id', id),
      this.supabase.supabase.from('checklist_item').select().eq('id', id),
    ];

    const [_, { data, error }] = await Promise.all(promises);

    if (error) {
      throw new BadRequestException(error.message);
    }

    let checklistData = data[0];
    checklistData.isCompleted = checklistData.is_completed;

    return checklistData;
  }
}
