import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { BoardLabelService } from './board_label.service';
import { CreateBoardLabelDto } from './dto/create-board_label.dto';
import { UpdateBoardLabelDto } from './dto/update-board_label.dto';

@Controller('board-label')
export class BoardLabelController {
  constructor(private readonly boardLabelService: BoardLabelService) {}

  @Post('new-label')
  create(@Body() createBoardLabelDto: CreateBoardLabelDto) {
    return this.boardLabelService.create(createBoardLabelDto);
  }

  @Post('add-label-to-card')
  addLabelToCard(@Body() req: { cardId: string; labelIds: string[] }) {
    console.log(req);
    return this.boardLabelService.addLabelToCard(req.cardId, req.labelIds);
  }

  @Put('delete-label-from-card')
  deleteLabelFromCard(@Body() req: { cardId: string; labelIds: string[] }) {
    console.log(req);
    return this.boardLabelService.deleteLabelFromCard(req.cardId, req.labelIds);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardLabelService.findOne(id);
  }

  @Get('get-all-in-board/:id')
  findAll(@Param('id') id: string) {
    return this.boardLabelService.findAll(id);
  }

  @Put()
  update(@Body() updateBoardLabelDto: UpdateBoardLabelDto) {
    return this.boardLabelService.update(updateBoardLabelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardLabelService.remove(id);
  }
}
