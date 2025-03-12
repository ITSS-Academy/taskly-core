import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Req,
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

  @Put()
  updateCard(@Body() req: any) {
    console.log(req);
    return this.cardService.updateCard(req);
  }

  @Post('/add-new-member')
  addNewMember(
    @Body() body: { cardId: string; userId: string },
    @Req() req: any,
  ) {
    return this.cardService.addNewMember(
      body.cardId,
      body.userId,
      req.user.uid,
    );
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

  @Put('/remove-member')
  removeMember(
    @Body() body: { cardId: string; userId: string },
    @Req() req: any,
  ) {
    return this.cardService.removeMember(
      body.cardId,
      body.userId,
      req.user.uid,
    );
  }

  @Get('get-all-by-uid/:offset/:limit')
  findAllByUid(
    @Param('offset') offset: number,
    @Param('limit') limit: number,
    @Req() req: any,
  ) {
    return this.cardService.findAllByUid(req.user.uid, offset, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }

  @Post('filter')
  fillter(
    @Body()
    req: {
      query: {
        labelIds: string[];
        memberIds: string[];
      };
      boardId: string;
    },
  ) {
    console.log(req);
    return this.cardService.filterCards(
      req.query.labelIds,
      req.query.memberIds,
      req.boardId,
    );
  }

  @Post('get-card-by-user')
  getCardByUser(@Req() req: any) {
    console.log('get card by user');
    return this.cardService.getCardByUser(req.user.uid);
  }
}
