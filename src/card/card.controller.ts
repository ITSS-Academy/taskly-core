import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  //
  @Post()
  create(@Body() req: { title: string; listId: string }) {
    return this.cardService.create(req.title, req.listId);
  }

  @Put('/:id')
  updateCard(@Param('id') id: string, @Body() req: UpdateCardDto) {
    return this.cardService.updateCard(id, req);
  }

  @Post('/add-new-member')
  addNewMember(@Body() req: { cardId: string; userId: string }) {
    return this.cardService.addNewMember(req.cardId, req.userId);
  }

  @Put('/position')
  updatePosition(@Body() cards: UpdateCardDto[]) {
    return this.cardService.updatePosition(cards);
  }

  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(id);
  }

  @Delete('/remove-member')
  removeMember(@Body() req: { cardId: string; userId: string }) {
    return this.cardService.removeMember(req.cardId, req.userId);
  }
}
