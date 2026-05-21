import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Discount } from '../products/entities/discount.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { userId, discount, items } = createOrderDto;

    const productIds = items.map((item) => item.productId);
    const products = await this.productRepository.findBy({ id: In(productIds) });
    const productMap = new Map(products.map((product) => [product.id, product]));

    const missingId = productIds.find((id) => !productMap.has(id));
    if (missingId) {
      throw new NotFoundException(`Product with id ${missingId} not found`);
    }

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return this.orderItemRepository.create({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(product.price),
      });
    });

    const totalWithoutDiscount = orderItems.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );
    let totalSell = totalWithoutDiscount;
    let appliedDiscountCode: string | undefined;

    const discountCode = discount?.trim();
    if (discountCode) {
      const discountEntity = await this.discountRepository.findOneBy({
        discount: discountCode,
        isUsed: false,
      });

      if (discountEntity) {
        totalSell = totalWithoutDiscount * 0.8;
        appliedDiscountCode = discountEntity.discount;
        discountEntity.isUsed = true;
        await this.discountRepository.save(discountEntity);
      }
    }

    const order = this.orderRepository.create({
      userId,
      discount: appliedDiscountCode,
      totalSell,
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Fetch user information and send confirmation email
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (user && user.email && user.name) {
        const orderWithItems = await this.orderRepository.findOne({
          where: { id: savedOrder.id },
          relations: ['items'],
        });

        if (orderWithItems) {
          const itemsWithNames = orderWithItems.items.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productName: product.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            };
          });

          await this.mailService.sendOrderConfirmation(
            user.name,
            user.email,
            orderWithItems,
            itemsWithNames,
          );
        }
      }
    } catch (err) {
      // Log error but don't fail the order creation if email fails
      console.error('Failed to send order confirmation email:', err);
    }

    return savedOrder;
  }

  findAll() {
    return this.orderRepository.find({ relations: ['items'] });
  }
}
