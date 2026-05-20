import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Discount } from '../products/entities/discount.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, Discount])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
