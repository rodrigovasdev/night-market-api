import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Discount } from './entities/discount.entity';
import { Review } from './entities/review.entity';
import { SubcategoriesModule } from '../subcategories/subcategories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Discount, Review]), SubcategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
