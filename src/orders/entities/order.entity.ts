import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ name: 'date' })
  date!: Date;

  @Column('decimal', { name: 'totalSell', precision: 10, scale: 2 })
  totalSell!: number;

  @Column({ name: 'userId' })
  userId!: number;

  @Column({ nullable: true })
  discount!: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items!: OrderItem[];
}
