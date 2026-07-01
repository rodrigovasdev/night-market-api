import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [ProductsModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}