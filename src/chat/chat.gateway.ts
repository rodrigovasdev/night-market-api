import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger, ValidationPipe, UsePipes } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService, GroqChatTurn } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly sessions = new Map<string, GroqChatTurn[]>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.sessions.set(client.id, []);
    this.logger.log(`Chat client connected: ${client.id}`);
    client.emit('chat:ready', {
      message: 'Night-bot en linea.',
      model: this.chatService.getModelName(),
    });
  }

  handleDisconnect(client: Socket) {
    this.sessions.delete(client.id);
    this.logger.log(`Chat client disconnected: ${client.id}`);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @SubscribeMessage('chat:message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMessageDto,
  ) {
    const previousTurns = this.sessions.get(client.id) ?? [];

    try {
      const response = await this.chatService.generateReply({
        message: payload.message,
        history: previousTurns,
      });

      this.sessions.set(client.id, response.history);

      const outgoingPayload = {
        reply: response.reply,
        products: response.products ?? [],
        timestamp: new Date().toISOString(),
      };

      client.emit('chat:response', outgoingPayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible generar la respuesta.';
      this.logger.error(`Groq chat failure for client ${client.id}`, error instanceof Error ? error.stack : undefined);
      throw new WsException(message);
    }
  }

  @SubscribeMessage('chat:reset')
  handleReset(@ConnectedSocket() client: Socket) {
    this.sessions.set(client.id, []);

    const payload = { message: 'Conversacion reiniciada' };
    client.emit('chat:reset', payload);
  }
}