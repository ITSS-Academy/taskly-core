import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BackgroundService {
  constructor(private supabase: SupabaseService) {}

  async findAllPredefined() {
    const { data: images, error } = await this.supabase.supabase
      .from('background')
      .select('id, fileName,fileLocation')
      .eq('isPredefined', true);
    if (error) {
      return new BadRequestException(error.message);
    }

    return images;

    //
    // const {data: colors, error: colorError} = await this.supabase.supabase
    //   .from('background')
    //   .select('id, color, isPredefined')
    //   .eq('isPredefined', true)
    //   .eq('fileLocation',null)
    //
    // if (colorError) {
    //   return new BadRequestException(colorError.message);
    // }
    //
    // Promise.all([
    //   this.supabase.supabase
    //     .from('background')
    //     .select('id, fileName, fileLocation')
    //     .eq('color', null),
    //
    // ]).then((values) => {
    //   return values[0].data
    // });
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.supabase
      .from('background')
      .select()
      .eq('id', id);
    if (error) {
      throw new BadRequestException(error.message);
    }
    console.log(data);
    return data[0].fileLocation;
  }

  async changBackground(
    file: Express.Multer.File,
    background: { backgroundId?: string; boardId: string },
  ) {
    const fileName = new Date();

    if (background.backgroundId) {
      const { data, error } = await this.supabase.supabase
        .from('board')
        .update({ backgroundId: background.backgroundId })
        .eq('id', background.boardId);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { data: backgroundData, error: backgroundError } =
        await this.supabase.supabase
          .from('background')
          .select('fileLocation')
          .eq('id', background.backgroundId);

      return {
        backgroundId: background.backgroundId,
        background: {
          fileLocation: backgroundData[0].fileLocation,
        },
      };
    } else if (file) {
      //upload to storage
      const { data: backgroundData, error: backgroundError } =
        await this.supabase.supabase.storage
          .from('background')
          .upload(`background/${fileName.getTime()}`, file.buffer, {
            upsert: true,
            contentType: file.mimetype,
          });
      if (backgroundError) {
        throw new BadRequestException(backgroundError.message);
      }
      //get public url
      const { data: publicURL } = this.supabase.supabase.storage
        .from('background')
        .getPublicUrl(`background/${fileName.getTime()}`);

      const { data, error } = await this.supabase.supabase
        .from('background')
        .insert({
          fileName: file.originalname,
          fileLocation: publicURL.publicUrl,
          isPredefined: false,
          createdAt: fileName,
        })
        .select();
      if (error) {
        throw new BadRequestException(error.message);
      }
      const { error: updateError } = await this.supabase.supabase
        .from('board')
        .update({ backgroundId: data[0].id })
        .eq('id', background.boardId);
      if (updateError) {
        throw new BadRequestException(updateError.message);
      }
      return {
        backgroundId: data[0].id,
        background: {
          fileLocation: data[0].fileLocation,
        },
      };
    } else {
      throw new BadRequestException('Background is required');
    }
  }
}
