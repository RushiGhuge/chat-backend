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

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  onModuleInit() {
    console.warn('Chat Server is Up');
    this.server.emit('getOnlineUsers', Object.keys(userSocketMap));
    // this.server.on('connection', (socket) => {
    //   console.log('Connected : ', socket?.id);
    // });
  }

  handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);
    const userId = socket.handshake.query.userId as string;
    if (userId?.length > 0 && userId !== undefined) {
      userSocketMap[userId] = socket?.id;
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
