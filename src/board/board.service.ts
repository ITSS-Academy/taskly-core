import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationType } from '../enums/notification-type.enum';

@Injectable()
export class BoardService {
  constructor(private supabase: SupabaseService) {}

  // async create(
  //   createBoardDto: CreateBoardDto,
  //   userId: string,
  //   file: Express.Multer.File,
  // ) {
  //   const newBoard = {
  //     name: createBoardDto.name,
  //     createdAt: new Date(),
  //     ownerId: userId,
  //   };
  //
  //   const { data, error: boardError } = await this.supabase.supabase
  //     .from('board')
  //     .insert(newBoard)
  //     .select();
  //   if (boardError) {
  //     return boardError.message;
  //   }
  //
  //   let board = data[0];
  //
  //   if (createBoardDto.background.color) {
  //     await this.supabase.supabase.from('background').insert({
  //       boardId: board.id,
  //       color: createBoardDto.background.color,
  //     });
  //   } else {
  //     const { data: background, error: backgroundError } =
  //       await this.supabase.supabase.storage
  //         .from('background')
  //         .upload(`background/${board.id}`, file.buffer, {
  //           upsert: true,
  //           contentType: file.mimetype,
  //         });
  //     if (backgroundError) {
  //       await this.supabase.supabase.from('board').delete().eq('id', board.id);
  //       return new BadRequestException(backgroundError.message);
  //     }
  //
  //     //get public url
  //     const { data: publicURL } = this.supabase.supabase.storage
  //       .from('background')
  //       .getPublicUrl(`background/${board.id}`);
  //
  //     const {} = await this.supabase.supabase.from('background').insert({
  //       boardId: board.id,
  //       fileLocation: publicURL,
  //       fileName: file.originalname,
  //     });
  //   }
  //   return board;
  // }

  async findAll(uid: string) {
    const { data, error } = await this.supabase.supabase
      .from('board')
      .select()
      .eq('ownerId', uid)
      .order('createdAt', { ascending: false });

    if (error) {
      return error.message;
    }

    //get cout of lists in board by promise
    const listsCountPromise = data.map(async (board: any) => {
      const { data: lists, error: listError } = await this.supabase.supabase
        .from('list')
        .select('id', { count: 'exact' })
        .eq('boardId', board.id);
      if (listError) {
        throw new BadRequestException(listError.message);
      }
      return lists;
    });

    //get members in boards by promise
    const membersPromise = data.map(async (board: any) => {
      const { data: members, error: memberError } = await this.supabase.supabase
        .from('board_members')
        .select('user_id')
        .eq('board_id', board.id);
      if (memberError) {
        throw new BadRequestException(memberError.message);
      }
      return members;
    });

    //promise all lists count and members 1
    const [listsCount, members] = await Promise.all([
      Promise.all(listsCountPromise),
      Promise.all(membersPromise),
    ]);

    //add count of lists to board
    data.forEach((board, index) => {
      board.listsCount = listsCount[index][0];
    });

    //add members to board
    data.forEach((board, index) => {
      board.members = members[index].map((member) => member.user_id);
    });

    return data;
  }

  async remove(id: string, uid: string) {
    //get BackgroundId from Board
    const { data: board, error: boardError } = await this.supabase.supabase
      .from('board')
      .select('backgroundId')
      .eq('id', id)
      .single();

    const { data: background, error: backgroundError } =
      await this.supabase.supabase
        .from('background')
        .select('isPredefined, fileName, createdAt')
        .eq('id', board.backgroundId)
        .single();

    if (backgroundError) {
      throw new BadRequestException(backgroundError.message);
    }

    if (!background.isPredefined) {
      const createdAtDate = new Date(background.createdAt);

      //delete from storage
      const { data: deleteStorage, error: deleteStorageError } =
        await this.supabase.supabase.storage
          .from('background')
          .remove([`background/${createdAtDate.getTime()}`]);

      if (deleteStorageError) {
        throw new BadRequestException(deleteStorageError.message);
      }

      const { data: deleteBackground, error: deleteBackgroundError } =
        await this.supabase.supabase
          .from('background')
          .delete()
          .eq('id', board.backgroundId);
      if (deleteBackgroundError) {
        throw new BadRequestException(deleteBackgroundError.message);
      }
    }

    //create notification to members in board
    const { data: members, error: memberError } = await this.supabase.supabase
      .from('board_members')
      .select('user_id')
      .eq('board_id', id);

    if (memberError) {
      throw new BadRequestException(memberError.message);
    }

    const newNotification = members.map((member) => {
      return {
        userId: member.user_id,
        boardId: id,
        type: NotificationType.REMOVED_FROM_BOARD,
        read: false,
        createdAt: new Date(),
        senderId: uid,
      };
    });

    const { data: deleteBoard, error: deleteBoardError } =
      await this.supabase.supabase.from('board').delete().eq('id', id);

    if (deleteBoardError) {
      throw new BadRequestException(deleteBoardError.message);
    }

    return deleteBoard;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto) {
    const { data, error } = await this.supabase.supabase
      .from('board')
      .update({
        name: updateBoardDto.name,
      })
      .eq('id', id)
      .single();
    if (error) {
      throw new BadRequestException(error.message);
    }

    console.log(data);

    return data;
  }

  async create(
    createBoardDto: CreateBoardDto,
    uid: string,
    file: Express.Multer.File,
  ) {
    if (!createBoardDto.backgroundId) {
      const date = new Date();
      //upload file
      const { data: background, error: backgroundError } =
        await this.supabase.supabase.storage
          .from('background')
          .upload(`background/${date.getTime()}`, file.buffer, {
            upsert: true,
            contentType: file.mimetype,
          });
      if (backgroundError) {
        throw new BadRequestException(backgroundError.message);
      }
      //get public url
      const { data: publicURL } = this.supabase.supabase.storage
        .from('background')
        .getPublicUrl(`background/${date.getTime()}`);

      //create a row in the background table
      const { data: backgroundData, error: backgroundDataError } =
        await this.supabase.supabase
          .from('background')
          .insert({
            fileLocation: publicURL.publicUrl,
            fileName: file.originalname,
            isPredefined: false,
            createdAt: date,
          })
          .select()
          .single();

      if (backgroundDataError) {
        throw new BadRequestException(backgroundDataError.message);
      }

      //create a row in the board table
      const { data: board, error: boardError } = await this.supabase.supabase
        .from('board')
        .insert({
          name: createBoardDto.name,
          createdAt: date,
          ownerId: uid,
          backgroundId: backgroundData.id,
        })
        .select();

      if (boardError) {
        throw new BadRequestException(boardError.message);
      }

      //get members in boards[0]
      const { data: members, error: memberError } = await this.supabase.supabase
        .from('board_members')
        .select('user_id')
        .eq('board_id', board[0].id);
      if (memberError) {
        throw new BadRequestException(memberError.message);
      }
      board[0].members = members.map((member) => member.user_id);

      return board[0];
    } else {
      const { data: board, error: boardError } = await this.supabase.supabase
        .from('board')
        .insert({
          name: createBoardDto.name,
          createdAt: new Date(),
          ownerId: uid,
          backgroundId: createBoardDto.backgroundId,
        })
        .select();

      if (boardError) {
        throw new BadRequestException(boardError.message);
      }

      //get members in boards[0]
      const { data: members, error: memberError } = await this.supabase.supabase
        .from('board_members')
        .select('user_id')
        .eq('board_id', board[0].id);

      if (memberError) {
        throw new BadRequestException(memberError.message);
      }
      board[0].members = members.map((member) => member.user_id);

      return board[0];
    }
  }

  async findInvitedBoards(uid: string) {
    const { data, error } = await this.supabase.supabase
      .from('board_members')
      .select('board_id')
      .eq('user_id', uid);

    if (error) {
      throw new BadRequestException(error.message);
    }

    const promises = data.map(async (board: any) => {
      const { data: boardData, error } = await this.supabase.supabase
        .from('board')
        .select()
        .eq('id', board.board_id)
        .single();

      if (error) throw new BadRequestException(error.message);
      return boardData;
    });

    const boards = await Promise.all(promises);

    const errorBoards = boards.filter((board) => board?.error);
    if (errorBoards.length > 0) {
      throw new BadRequestException(errorBoards[0].error.message);
    }

    // console.log(boards);
    return boards;
  }

  updateBackground(id: string, background: string | Express.Multer.File) {
    return this.supabase.supabase
      .from('board')
      .update({
        backgroundId: background,
      })
      .eq('id', id);
  }

  findBackground(id: string) {
    return this.supabase.supabase
      .from('background')
      .select()
      .eq('boardId', id)
      .single();
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.supabase
      .from('board')
      .select()
      .eq('id', id)
      .single();
    if (error) {
      throw new BadRequestException(error.message);
    }

    //get members
    const { data: members, error: memberError } = await this.supabase.supabase
      .from('board_members')
      .select('user_id')
      .eq('board_id', id);

    if (memberError) {
      data.members = [];
    } else {
      data.members = members.map((member) => member.user_id);
    }

    // console.log(data.backgroundId);

    //get Background
    const { data: background, error: backgroundError } =
      await this.supabase.supabase
        .from('background')
        .select('fileLocation, color')
        .eq('id', data.backgroundId)
        .single();

    if (backgroundError) {
      data.background = {};
    } else {
      data.background = background;
    }

    //get labels
    const { data: labels, error: labelError } = await this.supabase.supabase
      .from('board_label')
      .select()
      .eq('boardId', id);

    if (labelError) {
      data.labels = [];
    } else {
      data.labels = labels;
    }

    //get lists count in board
    const { data: lists, error: listError } = await this.supabase.supabase
      .from('list')
      .select('id', { count: 'exact' })
      .eq('boardId', id);

    if (listError) {
      data.listsCount = 0;
    }
    data.listsCount = lists[0];

    return data;
  }

  async search(search: string, uid: string) {
    // let { data, error } = await this.supabase.supabase
    //     .rpc('search_boards', {
    //       search_term: search,
    //     })
    //
    // if (error) {
    //   throw new BadRequestException(error.message);
    // }

    const { data: ownedBoards, error: ownedError } =
      await this.supabase.supabase
        .from('board')
        .select(`*`)
        .eq('ownerId', uid)
        .ilike('name', `%${search}%`);

    const { data: memberBoards, error: memberError } =
      await this.supabase.supabase
        .from('board')
        .select(`*,board_members!inner(*)`)
        .eq('board_members.user_id', uid)
        .ilike('name', `%${search}%`);

    const data = [...(ownedBoards || []), ...(memberBoards || [])];

    if (ownedError || memberError) {
      console.error(ownedError || memberError);
    }

    return data;
  }

  async removeMember(boardId: string, userId: string, uid: string) {
    const { data: board, error: boardError } = await this.supabase.supabase
      .from('board')
      .select('ownerId')
      .eq('id', boardId)
      .single();

    if (boardError) {
      throw new BadRequestException(boardError.message);
    }

    if (board.ownerId !== uid) {
      throw new BadRequestException('You are not owner of this board');
    }

    const { data: deleteMember, error: deleteMemberError } =
      await this.supabase.supabase
        .from('board_members')
        .delete()
        .eq('board_id', boardId)
        .eq('user_id', userId);

    if (deleteMemberError) {
      throw new BadRequestException(deleteMemberError.message);
    }

    //create notification
    const { data: notification, error: notificationError } =
      await this.supabase.supabase.from('notification').insert({
        userId: userId,
        boardId: boardId,
        type: NotificationType.REMOVED_FROM_BOARD,
        read: false,
        createdAt: new Date(),
        senderId: uid,
      });

    if (notificationError) {
      throw new BadRequestException(notificationError.message);
    }

    return deleteMember;
  }
}
