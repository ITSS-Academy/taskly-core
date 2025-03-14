import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(80, {
  namespace: '/noti',
  cors: true,
})
export class NotiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  clients: { [uid: string]: string }[] = [];

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('send')
  handleSendNoti(
    client: Socket,
    payload: {
      reciever: string;
    },
  ): void {
    console.log('Sending noti', payload);
    const target = this.clients.find((client) => client[payload.reciever]);
    console.log('Target', target);
    if (target) {
      console.log('Sending noti to', target[payload.reciever]);
      this.server.to(target[payload.reciever]).emit('newNoti');
    }
  }

  @SubscribeMessage('leave')
  handleLeaveNoti(client: Socket, uid: string): void {
    console.log('Leaving noti', uid, client.id);
    console.log('Clients', this.clients);
    this.clients = this.clients.filter((client) => !client[uid]);
  }

  @SubscribeMessage('join')
  handleJoinNoti(client: Socket, uid: string): void {
    console.log('Joining noti', uid, client.id);
    this.clients.push({ [uid]: client.id });
    console.log('Clients', this.clients);
  }

  @SubscribeMessage('addToCard')
  handleAddToCard(client: Socket, payload: { cardId: string; userId: string }) {
    console.log('Adding to card', payload);
    const target = this.clients.find((client) => client[payload.userId]);
    console.log('Target', target);
    if (target) {
      console.log('Adding to card', target[payload.userId]);
      this.server.to(target[payload.userId]).emit('newNoti');
    }
  }

  @SubscribeMessage('deleteBoard')
  handleDeleteBoard(
    client: Socket,
    payload: { boardId: string; userIds: string[] },
  ) {
    if (!payload || !payload.userIds) {
      return;
    }

    console.log('Deleting board:', payload.boardId);
    console.log('UserIds', payload.userIds);
    for (const userId of this.clients) {
      console.log('User', userId);
    }

    payload.userIds.forEach((userId) => {
      const targetSocket = this.clients.find((c) => c[userId]);
      if (targetSocket) {
        this.server.to(targetSocket[userId]).emit('boardDeleted', {
          boardId: payload.boardId,
          message: 'You have not been removed from the board',
        });
      }
    });
  }

  @SubscribeMessage('acceptInvite')
  handleAcceptInvite(
    client: Socket,
    payload: { boardId: string; userId: string; receiverId: string },
  ) {
    console.log('Accepting invite', payload);
    const target = this.clients.find((client) => client[payload.receiverId]);
    console.log('Target', target);
    if (target) {
      console.log('Accepting invite', target[payload.receiverId]);
      this.server.to(target[payload.receiverId]).emit('acceptedInvite', {
        boardId: payload.boardId,
        userId: payload.userId,
      });
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket): any {
    this.clients = this.clients.filter(
      (c) => !Object.values(c).includes(client.id),
    );
    console.log('Clients', this.clients);
    console.log('Client disconnected', client.id);
  }
}
