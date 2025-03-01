import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Put,
  UploadedFile,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // @Post('new-background')
  // create(
  //   @Body() createBoardDto: CreateBoardDto,
  //   @Req() req: any,
  //   @UploadedFile() background: Express.Multer.File,
  // ) {
  //   console.log(req.user.uid);
  //   return this.boardService.create(createBoardDto, req.user.uid, background);
  // }

  @Post()
  @UseInterceptors(FileInterceptor('background'))
  createPredefined(
    @Body() createBoardDto: CreateBoardDto,
    @Req() req: any,
    @UploadedFile() background?: Express.Multer.File,
  ) {
    console.log(req.user.uid);
    console.log(background);
    console.log(createBoardDto);

    return this.boardService.create(createBoardDto, req.user.uid, background);
  }

  @Put('background/:id')
  updateBackground(@Param('id') id: string, @Body() backgroundId: string) {
    return this.boardService.updateBackground(id, backgroundId);
  }

  @Get('get-all-by-uid')
  findAll(@Req() req: any) {
    return this.boardService.findAll(req.user.uid);
  }

  @Get('get-invited-boards')
  findInvitedBoards(@Req() req: any) {
    return this.boardService.findInvitedBoards(req.user.uid);
  }

  // @Get('background/:id')
  // findBackground(@Param('id') id: string) {
  //   return this.boardService.findBackground(id);
  // }

  //
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(id);
  }

  //
  @Post('search')
  search(@Body() search: { search: string }) {
    console.log(search);
    return this.boardService.search(search.search);
  }

  //update name
  @Put('name/:id')
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardService.update(id, updateBoardDto);
  }

  //update background

  //delete board
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardService.remove(id);
  }
}
