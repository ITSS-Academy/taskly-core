import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(81, {
  cors: true,
  transports: ['websocket'],
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

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket): any {
    this.clients = this.clients.filter((client) => client.id !== client.id);
    console.log('Clients', this.clients);
    console.log('Client disconnected', client.id);
  }
}
