import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    public chatGateway: ChatGateway,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('send_msg_event')
  sendMessageEvent(@Body() { body, receiverId }: any) {
    console.error('**************************************************', body);
    return this.chatGateway.handleMessage(body, receiverId);
  }
}
