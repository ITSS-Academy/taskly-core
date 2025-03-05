import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(81, {
  cors: true,
  transports: ['websocket'],
})
export class NotiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  clients: { [uid: string]: string }[] = [];

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('join')
  handleJoinNoti(client: Socket, uid: string): void {
    this.clients.push({ [client.id]: uid });
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected', client.id);
  }

  handleDisconnect(client: Socket): any {
    console.log('Client disconnected', client.id);
  }
}
