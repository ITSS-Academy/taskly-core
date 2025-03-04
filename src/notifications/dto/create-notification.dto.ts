import { NotificationType } from '../../enums/notification-type.enum';
import { IsEnum } from 'class-validator';
import { UserModel } from '../../gateway/models/user.model';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class CreateNotificationDto {
  type?: NotificationType;

  boardId?: string;
  cardId?: string;

  users: CreateUserDto[];
}
