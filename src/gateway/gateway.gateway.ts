import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { BoardModel } from './models/board.model';
import { ListModel } from './models/list.model';

@WebSocketGateway(80, {
  namespace: '/board',
  cors: true,
})
export class GatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  boards: {
    [boardId: string]: {
      lists: ListModel[];
      board: BoardModel;
      members: {
        id: string;
      }[];
    };
  } = {};

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, payload: any) {
    console.log('ádf');
    client.emit('message', 'Hello world!');
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      board: BoardModel;
      lists: ListModel[];
    },
  ) {
    // console.log('Join board', payload);
    const { board, lists } = payload;
    if (!this.boards[board.id]) {
      this.boards[board.id] = {
        board: board,
        lists: lists,
        members: [
          {
            id: client.id,
          },
        ],
      };
    } else {
      this.boards[board.id].members.push({
        id: client.id,
      });
    }

    client.join(board.id);

    console.log('Client joined board', client.id, board.id);
  }

  @SubscribeMessage('backgroundChange')
  handleBackgroundChange(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      boardId: string;
      background: {
        id: string;
        fileLocation: string;
      };
    },
  ) {
    const { boardId, background } = payload;
    console.log('Background change', boardId, background);
    this.server.to(boardId).emit('backgroundChange', { boardId, background });
  }

  @SubscribeMessage('leaveBoard')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      boardId: string;
    },
  ) {
    const { boardId } = payload;
    console.log('leave', boardId);
    client.leave(boardId);
    this.boards[boardId].members = this.boards[boardId].members.filter(
      (member) => member.id !== client.id,
    );
    console.log('Client left board', client.id, boardId);

    if (this.boards[boardId].members.length === 0) {
      delete this.boards[boardId];
      console.log(`Board ${boardId} has been removed.`);
    }
  }

  @SubscribeMessage('listsChange')
  handleListsChange(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      boardId: string;
      lists: ListModel[];
    },
  ) {
    const { boardId, lists } = payload;
    // console.log('Lists change', boardId, lists);
    // if (!this.boards[boardId] || this.boards[boardId].lists === undefined) {
    //   return;
    // }
    this.boards[boardId].lists = lists;
    this.server.to(boardId).emit('listsChange', lists);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket): any {
    for (const boardId in this.boards) {
      this.boards[boardId].members = this.boards[boardId].members.filter(
        (member) => member.id !== client.id,
      );
      if (this.boards[boardId].members.length === 0) {
        delete this.boards[boardId];
        console.log(`Board ${boardId} has been removed.`);
      }
    }
    console.log('Client disconnected', client.id);
  }
}
