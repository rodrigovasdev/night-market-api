import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../subcategories/entities/subcategory.entity';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { Review } from '../products/entities/review.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { seedData } from './data/seed-data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async runSeed() {
    await this.cleanDatabase();
    await this.insertData();
    this.logger.log('Seed completed successfully');
  }

  private async cleanDatabase() {
    this.logger.log('Cleaning database...');
    await this.dataSource.transaction(async (manager) => {
      await manager.createQueryBuilder().delete().from(OrderItem).execute();
      await manager.createQueryBuilder().delete().from(Order).execute();
      await manager.createQueryBuilder().delete().from(Review).execute();
      await manager.createQueryBuilder().delete().from(ProductImage).execute();
      await manager.createQueryBuilder().delete().from(Product).execute();
      await manager.createQueryBuilder().delete().from(Subcategory).execute();
      await manager.createQueryBuilder().delete().from(Category).execute();
    });
  }

  private async insertData() {
    for (const categoryData of seedData) {
      this.logger.log(`Inserting category: ${categoryData.name}`);
      const category = this.categoryRepository.create({ name: categoryData.name });
      const savedCategory = await this.categoryRepository.save(category);

      for (const subcategoryData of categoryData.subcategories) {
        this.logger.log(`  Inserting subcategory: ${subcategoryData.name}`);
        const subcategory = this.subcategoryRepository.create({
          name: subcategoryData.name,
          category: savedCategory,
        });
        const savedSubcategory = await this.subcategoryRepository.save(subcategory);

        for (const productData of subcategoryData.products) {
          this.logger.log(`    Inserting product: ${productData.name}`);
          const { images, ...productFields } = productData;
          const product = this.productRepository.create({
            ...productFields,
            subcategory: savedSubcategory,
            images: images.map((img) => this.productImageRepository.create(img)),
          });
          await this.productRepository.save(product);
        }
      }
    }
  }

  async updatePrices() {
    const result = await this.dataSource.query(
      `UPDATE product SET price = FLOOR(price * 1000)`,
    );
    const rowsAffected = result[1] ?? 'unknown';
    this.logger.log(`Prices updated. Rows affected: ${rowsAffected}`);
    return { message: 'Prices updated successfully', rowsAffected };
  }
}
