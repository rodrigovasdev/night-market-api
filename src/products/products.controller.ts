import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CalculateOrderDto } from './dto/calculate-order.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('latest')
  findLatest() {
    return this.productsService.findLatest();
  }

  @Get('top-selling')
  findTopSelling() {
    return this.productsService.findTopSelling();
  }

  @Post('calculate')
  calculateOrder(@Body() calculateOrderDto: CalculateOrderDto) {
    return this.productsService.calculateOrder(calculateOrderDto);
  }

  @Post(':id/reviews')
  createReview(@Param('id') id: string, @Body() createReviewDto: CreateReviewDto) {
    return this.productsService.createReview(+id, createReviewDto);
  }

  @Get(':id/reviews')
  findReviewsByProduct(@Param('id') id: string) {
    return this.productsService.findReviewsByProduct(+id);
  }

  @Get('filter')
  findByFilters(
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
  ) {
    return this.productsService.findByFilters(
      categoryId ? +categoryId : undefined,
      subcategoryId ? +subcategoryId : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
