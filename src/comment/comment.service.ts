import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Card } from '../card/entities/card.entity';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private supabase: SupabaseService,
  ) {}

  async create(createCommentDto: CreateCommentDto, uid: string) {
    const { data, error } = await this.supabase.supabase
      .from('comment')
      .insert({ ...createCommentDto, userId: uid })
      .select();
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data[0];
  }

  async findAll(id: string) {
    const { data, error } = await this.supabase.supabase
      .from('comment')
      .select()
      .eq('cardId', id);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const { data, error } = await this.supabase.supabase
      .from('comment')
      .update(updateCommentDto)
      .eq('id', id)
      .select();
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async remove(id: string) {
    const { data, error } = await this.supabase.supabase
      .from('comment')
      .delete()
      .eq('id', id)
      .select();
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data[0];
  }
}
