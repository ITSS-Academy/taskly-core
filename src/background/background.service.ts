import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BackgroundService {
  constructor(private supabase: SupabaseService) {}

  async findAllPredefined() {
    // const { data: images, error } = await this.supabase.supabase
    //   .from('background')
    //   .select('id, fileName,fileLocation, isPredefined')
    //   .eq('isPredefined', true)
    //   .eq('color',null)
    // if (error) {
    //   return new BadRequestException(error.message);
    // }
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

    Promise.all([
      this.supabase.supabase
        .from('background')
        .select('id, fileName, fileLocation')
        .eq('color', null),
      this.supabase.supabase
        .from('background')
        .select('id, color')
        .eq('fileLocation', null),
    ]).then((values) => {
      return {
        images: values[0].data,
        colors: values[1].data,
      };
    });
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

  async changBackground(file: Express.Multer.File, backgroundId) {}
}
