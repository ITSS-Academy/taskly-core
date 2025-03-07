import { CreateListDto } from '../../list/dto/create-list.dto';

export class CreateCardDto {
  title: string;
  description: string;
  dueDate: Date | null;
}
