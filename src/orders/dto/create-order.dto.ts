import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

class CreateOrderItemDto {
  @IsInt()
  @IsPositive()
  productId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  userId!: number;

  @IsOptional()
  @IsString()
  discount?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
