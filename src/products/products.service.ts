import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CalculateOrderDto } from './dto/calculate-order.dto';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Discount } from './entities/discount.entity';
import { Review } from './entities/review.entity';
import { Subcategory } from '../subcategories/entities/subcategory.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { images = [], subcategoryId, ...productData } = createProductDto;

    let subcategory: Subcategory | null = null;
    if (subcategoryId) {
      subcategory = await this.subcategoryRepository.findOneBy({ id: subcategoryId });
      if (!subcategory) throw new NotFoundException(`Subcategory with id ${subcategoryId} not found`);
    }

    const product = this.productRepository.create({
      ...productData,
      images: images.map((img) => this.productImageRepository.create(img)),
      ...(subcategory && { subcategory }),
    });
    return this.productRepository.save(product);
  }

  findAll() {
    return this.productRepository.find({ relations: ['images', 'subcategory'] });
  }

  findLatest() {
    return this.productRepository.find({
      relations: ['images', 'subcategory'],
      order: { id: 'DESC' },
      take: 4,
    });
  }

  async findTopSelling(limit = 4) {
    const topSelling = await this.orderItemRepository.query(
      `
        SELECT
          oi."productId" AS "productId",
          SUM(oi.quantity)::int AS "soldQuantity"
        FROM order_items oi
        GROUP BY oi."productId"
        ORDER BY SUM(oi.quantity) DESC
        LIMIT $1
      `,
      [limit],
    );

    if (!topSelling.length) {
      return [];
    }

    const productIds = topSelling.map(({ productId }) => Number(productId));
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['images', 'subcategory'],
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    return topSelling
      .map((item) => {
        const product = productMap.get(Number(item.productId));
        if (!product) {
          return null;
        }

        return {
          ...product,
          soldQuantity: Number(item.soldQuantity),
        };
      })
      .filter((product): product is Product & { soldQuantity: number } => product !== null);
  }

  findOne(id: number) {
    return this.productRepository.findOne({ where: { id }, relations: ['images', 'subcategory'] });
  }

  async incrementVisits(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);
    await this.productRepository.increment({ id }, 'visits', 1);
    return { id, visits: product.visits + 1 };
  }

  searchByTerms(terms: string[]) {
    const conditions = terms.flatMap((term) => [
      { name: ILike(`%${term}%`) },
      { shortDescription: ILike(`%${term}%`) },
    ]);

    return this.productRepository.find({
      where: conditions,
      relations: ['images', 'subcategory'],
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { images, subcategoryId, ...productData } = updateProductDto;

    if (subcategoryId !== undefined) {
      const subcategory = await this.subcategoryRepository.findOneBy({ id: subcategoryId });
      if (!subcategory) throw new NotFoundException(`Subcategory with id ${subcategoryId} not found`);
      (productData as any).subcategory = subcategory;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        await queryRunner.manager.insert(
          ProductImage,
          images.map((img) => ({ ...img, product: { id } })),
        );
      }
      await queryRunner.manager.update(Product, id, productData);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) return null;
    return this.productRepository.remove(product);
  }

  async createReview(productId: number, createReviewDto: CreateReviewDto) {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      productId,
      product,
    });

    return this.reviewRepository.save(review);
  }

  async findReviewsByProduct(productId: number) {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    return this.reviewRepository.find({
      where: { productId },
      order: { id: 'DESC' },
    });
  }

  async findByFilters(categoryId?: number, subcategoryId?: number) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category');

    if (subcategoryId) {
      qb.andWhere('subcategory.id = :subcategoryId', { subcategoryId });
    }

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    return qb.getMany();
  }

  async calculateOrder(calculateOrderDto: CalculateOrderDto) {
    const { items, discountCode } = calculateOrderDto;

    const ids = items.map((item) => item.productId);
    const products = await this.productRepository.findBy({ id: In(ids) });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const missingId = ids.find((id) => !productMap.has(id));
    if (missingId) {
      throw new NotFoundException(`Product with id ${missingId} not found`);
    }

    let totalQuantity = 0;
    let totalValue = 0;

    const detail = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;

      totalQuantity += item.quantity;
      totalValue += subtotal;

      return {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });

    let discountApplied = false;
    let finalValue = totalValue;

    if (discountCode) {
      const discount = await this.discountRepository.findOneBy({
        discount: discountCode,
        isUsed: false,
      });

      if (discount) {
        finalValue = totalValue * 0.8;
        discountApplied = true;
        await this.discountRepository.save(discount);
      }
    }

    return {
      totalQuantity,
      totalValue: finalValue,
      ...(discountApplied && { originalValue: totalValue, discountApplied: true }),
      detail,
    };
  }
}
