import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Review } from './review.entity';
import { Subcategory } from '../../subcategories/entities/subcategory.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shortDescription: string;

  @Column('text')
  longDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  visits: number;

  @Column({ nullable: true })
  specifications: string;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => Review, (review) => review.product, { cascade: true })
  reviews: Review[];

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.products, { nullable: true, onDelete: 'SET NULL' })
  subcategory: Subcategory;
}

