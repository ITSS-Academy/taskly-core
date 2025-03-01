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
} from '@nestjs/common';
import { BackgroundService } from './background.service';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { UpdateBackgroundDto } from './dto/update-background.dto';

@Controller('background')
export class BackgroundController {
  constructor(private readonly backgroundService: BackgroundService) {}

  @Get('all')
  findAllPredefined() {
    return this.backgroundService.findAllPredefined();
  }

  @Put('upload')
  changeBackground(
    @Body() backgroundId: { backgroundId: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.backgroundService.changBackground(
      file,
      backgroundId.backgroundId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(id);
    return this.backgroundService.findOne(id);
  }
}
