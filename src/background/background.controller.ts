import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BackgroundService } from './background.service';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { UpdateBackgroundDto } from './dto/update-background.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('background')
export class BackgroundController {
  constructor(private readonly backgroundService: BackgroundService) {}

  @Get('all')
  findAllPredefined() {
    return this.backgroundService.findAllPredefined();
  }

  @Put('upload')
  @UseInterceptors(FileInterceptor('background'))
  changeBackground(
    @Body() background: { backgroundId?: string; boardId: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.backgroundService.changBackground(file, background);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(id);
    return this.backgroundService.findOne(id);
  }
}
