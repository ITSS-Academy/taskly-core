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
import { ChecklistItemService } from './checklist-item.service';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';

@Controller('checklist-item')
export class ChecklistItemController {
  constructor(private readonly checklistItemService: ChecklistItemService) {}

  @Post()
  create(@Body() createChecklistItemDto: CreateChecklistItemDto) {
    return this.checklistItemService.create(createChecklistItemDto);
  }

  @Put('toogle')
  toogleChecklistItem(@Body() req: { id: string; isCompleted: boolean }) {
    return this.checklistItemService.toogleChecklistItem(
      req.id,
      req.isCompleted,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checklistItemService.remove(id);
  }
}
