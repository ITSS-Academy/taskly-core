import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { SupabaseService } from '../supabase/supabase.service';
import * as CardDTO from './dto/create-card-notification.dto';
import { range } from 'rxjs';
import { NotificationType } from '../enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string, limit: number, offset: number) {
    const { data: notifications, error: fetchError } =
      await this.supabase.supabase
        .from('notification')
        .select()
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

    if (fetchError) {
      throw new BadRequestException(fetchError.message);
    }

    if (!notifications || notifications.length === 0) {
      return [];
    }

    this.updateReadStatus(notifications.map((noti) => noti.id));

    console.log(notifications);
    return notifications;
  }

  async updateReadStatus(ids: number[]) {
    if (ids.length === 0) return;

    await this.supabase.supabase
      .from('notification')
      .update({ read: true })
      .in('id', ids);
  }

  async isNewNotification(userId: string) {
    const { data, error } = await this.supabase.supabase
      .from('notification')
      .select()
      .eq('userId', userId)
      .eq('read', false)
      .single();

    if (error) {
      return false;
    }
    return data.length > 0;
  }

  async isAcceptNotification(notificationId: string, isAccepted: boolean) {
    // Lấy dữ liệu của thông báo trước khi xóa
    const { data: noti, error } = await this.supabase.supabase
      .from('notification')
      .select('boardId, userId, senderId')
      .eq('id', notificationId)
      .single();

    if (error || !noti) {
      throw new BadRequestException('Notification not found');
    }

    const boardId = noti.boardId;
    const receiver = noti.userId;
    const sender = noti.senderId;

    const { error: deleteError } = await this.supabase.supabase
      .from('notification')
      .delete()
      .eq('id', notificationId);

    if (deleteError) {
      throw new BadRequestException(deleteError.message);
    }

    // check if user is already a member of this board
    const { data: boardMember, error: boardMemberError } =
      await this.supabase.supabase
        .from('board_members')
        .select()
        .eq('user_id', receiver)
        .eq('board_id', boardId)
        .single();

    if (boardMemberError) {
      throw new BadRequestException(boardMemberError.message);
    }

    if (boardMember) {
      throw new BadRequestException('User is already a member of this board');
    }

    if (isAccepted && boardId) {
      const { data, error } = await this.supabase.supabase
        .from('board_members')
        .insert({
          user_id: receiver,
          board_id: boardId,
        });

      if (error) {
        throw new BadRequestException(error.message);
      }

      // create notification for sender
      const newNotification = {
        type: NotificationType.ACCEPT_INVITE,
        boardId,
        userId: sender,
        senderId: receiver,
        read: false,
      };

      const { data: senderNoti, error: senderNotiError } =
        await this.supabase.supabase
          .from('notification')
          .insert(newNotification)
          .select();

      if (senderNotiError) {
        throw new BadRequestException(senderNotiError.message);
      }

      return data;
    }

    if (!isAccepted && boardId) {
      const newNotification = {
        type: NotificationType.DECLINE_INVITE,
        boardId,
        userId: sender,
        senderId: receiver,
        read: false,
      };

      const { data: senderNoti, error: senderNotiError } =
        await this.supabase.supabase
          .from('notification')
          .insert(newNotification)
          .select();

      if (senderNotiError) {
        throw new BadRequestException(senderNotiError.message);
      }
      return senderNoti;
    }

    return {
      statusCode: HttpStatus.OK,
    };
  }

  async create(createNotificationDto: CreateNotificationDto, senderId: string) {
    //check users is invited or not for createNotificationDto.users
    const { data: existUser, error: existError } = await this.supabase.supabase
      .from('notification')
      .select('userId')
      .in(
        'userId',
        createNotificationDto.users.map((user) => user.id),
      );
    if (existError) {
      throw new BadRequestException(existError.message);
    }

    //check if user is already invited, return uid of user
    const invitedUser = existUser.map((user) => user.userId);
    if (invitedUser.length > 0) {
      //getName of user
      const { data: users, error: usersError } = await this.supabase.supabase
        .from('user')
        .select('name')
        .in('id', invitedUser);

      const usersName = users.map((user) => user.name);

      throw new BadRequestException(
        `${usersName.join(', ')} is already invited`,
      );
    }

    const newNotifications = createNotificationDto.users.map((user) => {
      return {
        type: NotificationType.INVITE_BOARD,
        userId: user.id,
        senderId,
        read: false,
        boardId: createNotificationDto.boardId,
      };
    });

    const { data, error } = await this.supabase.supabase
      .from('notification')
      .insert(newNotifications)
      .select();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async createCardNotification(
    createNotificationDto: CardDTO.CreateNotificationDto,
    senderId: string,
  ) {
    const newNotification = {
      ...createNotificationDto,
      read: false,
      senderId,
    };

    const { data, error } = await this.supabase.supabase
      .from('notification')
      .insert(newNotification)
      .select();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async remove(id: string) {
    const { data, error } = await this.supabase.supabase
      .from('notification')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}
