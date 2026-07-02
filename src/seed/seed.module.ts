import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../subcategories/entities/subcategory.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Subcategory, Product, ProductImage]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
