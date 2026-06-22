import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private activeUsers = new Map<number, string>();

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (userId && !isNaN(userId)) {
      this.activeUsers.set(userId, client.id);
      console.log(`[Socket] Користувач ${userId} підключився`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.activeUsers.entries()) {
      if (socketId === client.id) {
        this.activeUsers.delete(userId);
        console.log(`[Socket] Користувач ${userId} відключився`);
        break;
      }
    }
  }

  notifyUser(userId: number, payload: any) {
    const socketId = this.activeUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newMessage', payload);
    }
  }
}