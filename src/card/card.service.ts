import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Comment } from '../comment/entities/comment.entity';
import { Repository } from 'typeorm';
import { ChecklistItem } from '../checklist-item/entities/checklist-item.entity';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardService {
  constructor(private supabase: SupabaseService) {}

  async create(title: string, listId: string) {
    let lastPosition!: number;

    const { data, error } = await this.supabase.supabase
      .from('card')
      .select('position')
      .eq('listId', listId)
      .order('position', { ascending: false })
      .limit(1);

    lastPosition = data[0]?.position;

    if (lastPosition !== undefined) {
      lastPosition = lastPosition + 1;
    } else {
      lastPosition = 0;
    }

    const newCard = {
      title: title,
      description: '',
      listId: listId,
      position: lastPosition,
    };
    return this.supabase.supabase.from('card').insert(newCard).select();
  }

  async findAll() {}

  remove(id: string) {
    return this.supabase.supabase.from('card').delete().eq('id', id);
  }

  async updateCard(id: string, card: UpdateCardDto) {
    if (!card) {
      throw new BadRequestException('Title is required');
    }
    const { data, error } = await this.supabase.supabase
      .from('card')
      .update(card)
      .eq('id', id)
      .select();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async updateDescription(id: string, description: string) {
    if (!description) {
      throw new BadRequestException('Description is required');
    }
    const { data, error } = await this.supabase.supabase
      .from('card')
      .update({ description })
      .eq('id', id)
      .select();

    if (error) {
      throw new BadRequestException(error.message);
    }
    if (data.length == 0) {
      throw new BadRequestException('Card not found');
    }

    return data;
  }

  updatePosition(cards: UpdateCardDto[]) {
    if (!cards) {
      throw new BadRequestException('No cards provided');
    }

    const promises = cards.map((card, index) => {
      return this.supabase.supabase
        .from('card')
        .update({ position: index })
        .eq('id', card.id)
        .select();
    });

    return Promise.all(promises);
  }

  async addNewMember(cardId: string, userId: string) {
    const { data: exitingMemberData, error: exitingMemberDataError } =
      await this.supabase.supabase
        .from('user_cards')
        .select()
        .eq('cardId', cardId)
        .eq('userId', userId);
    if (exitingMemberData.length > 0) {
      throw new BadRequestException('User already a member');
    }

    const newMember = {
      cardId,
      userId,
    };

    const { data, error } = await this.supabase.supabase
      .from('user_cards')
      .insert(newMember)
      .select();
    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async removeMember(cardId: string, userId: string) {
    const { data, error } = await this.supabase.supabase
      .from('user_cards')
      .delete()
      .eq('cardId', cardId)
      .eq('userId', userId);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }
}
