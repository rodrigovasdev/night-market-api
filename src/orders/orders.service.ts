import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Discount } from '../products/entities/discount.entity';
import { CreateOrderDto } from './dto/create-order.dto';

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

    return this.orderRepository.save(order);
  }

  findAll() {
    return this.orderRepository.find({ relations: ['items'] });
  }
}
