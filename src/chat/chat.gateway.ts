import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  onModuleInit() {
    console.log('Server is Up');

    this.server.on('connection', (socket) => {
      console.log('Connected : ', socket?.id);

      socket.on('disconnect', () => {
        console.log('Disconnected : ', socket?.id);
      });
    });
  }

  handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log('Client disconnected:', socket.id);
  }

  @SubscribeMessage('chatMessage')
  handleMessage(client: Socket, payload: string): void {
    console.log(payload);
    this.server.emit('chatMessage', payload);
  }
}
