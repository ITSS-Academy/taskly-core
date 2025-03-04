import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { BoardModel } from './models/board.model';
import { ListModel } from './models/list.model';

@WebSocketGateway(80, {
  cors: true,
  transports: ['websocket'],
})
export class GatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
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
    console.log('Join board', payload);
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

    console.log('Client joined board', client.id, board.id);
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
    this.boards[boardId].lists = lists;
    client.to(boardId).emit('listsChange', lists);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket): any {
    client.leave('abc');
    if (this.boards['abc']) {
      this.boards['abc'].members = this.boards['abc'].members.filter(
        (member) => member.id !== client.id,
      );
    }
    console.log('Client disconnected', client.id);
  }
}
