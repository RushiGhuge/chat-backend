import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

export const userSocketMap = {};

@WebSocketGateway({
  transports: ['websocket', 'polling'], // Use websocket as primary transport
  pingTimeout: 60000, // 60 seconds before considering a connection dead
  pingInterval: 25000,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  onModuleInit() {
    console.warn('Chat Server is Up');
    this.server.emit('getOnlineUsers', Object.keys(userSocketMap));
  }

  handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);
    const userId = socket.handshake.query.userId as string;
    if (userId?.length > 0 && userId !== undefined) {
      userSocketMap[userId] = socket?.id;
      socket.join(userId);
      this.server.emit('getOnlineUsers', Object.keys(userSocketMap));
    }
  }

  handleDisconnect(socket: Socket) {
    console.error('Client disconnected:', socket.id);
    const userId = socket.handshake.query.userId as string;
    delete userSocketMap[userId];
    this.server.emit('getOnlineUsers', Object.keys(userSocketMap));
  }

  @SubscribeMessage('chatMessage')
  handleMessage(@MessageBody() body: any, receiverId: string) {
    const socketId = this.getSocketIdUsingUserId(receiverId);
    this.server.to(socketId).emit('chatMessage', {
      message: 'message',
      content: body,
    });
    return 'Yes';
  }

  getSocketIdUsingUserId(userId: string) {
    return userSocketMap[userId];
  }
}
