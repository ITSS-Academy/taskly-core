import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBoardLabelDto } from './dto/create-board_label.dto';
import { UpdateBoardLabelDto } from './dto/update-board_label.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BoardLabelService {
  constructor(private supabase: SupabaseService) {}

  async create(createBoardLabelDto: CreateBoardLabelDto) {
    const { data: exitingBoard, error } = await this.supabase.supabase
      .from('board')
      .select('id')
      .eq('id', createBoardLabelDto.boardId);
    if (error) {
      throw new BadRequestException(error.message);
    }
    if (exitingBoard.length === 0) {
      throw new BadRequestException('Board not found');
    }
    const { data, error: insertError } = await this.supabase.supabase
      .from('board_label')
      .insert(createBoardLabelDto);
    if (insertError) {
      throw new BadRequestException(insertError.message);
    }
    return data;
  }

  async findAll(boardId: string) {
    const { data: board, error: boardError } = await this.supabase.supabase
      .from('board')
      .select('id')
      .eq('id', boardId);
    if (boardError) {
      throw new BadRequestException(boardError.message);
    }

    if (board.length === 0) {
      throw new BadRequestException('Board not found');
    }

    const { data, error } = await this.supabase.supabase
      .from('board_label')
      .select()
      .eq('boardId', boardId);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.supabase
      .from('board_label')
      .select()
      .eq('id', id)
      .single();
    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async update(updateBoardLabelDto: UpdateBoardLabelDto) {
    const { data, error } = await this.supabase.supabase
      .from('board_label')
      .update(updateBoardLabelDto)
      .eq('id', updateBoardLabelDto.id)
      .select();
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async remove(id: string) {
    const { data, error } = await this.supabase.supabase
      .from('board_label')
      .delete()
      .eq('id', id);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async addLabelToCard(cardId: string, boardLabelId: string) {
    const { data: exitingCardLabel, error } = await this.supabase.supabase
      .from('labels_cards')
      .select()
      .eq('cardId', cardId)
      .eq('boardLabelId', boardLabelId);
    if (error) {
      throw new BadRequestException(error.message);
    }
    if (exitingCardLabel.length > 0) {
      throw new BadRequestException('Label already added to card');
    }

    return this.supabase.supabase
      .from('labels_cards')
      .insert({ cardId, boardLabelId })
      .select();
  }
}
