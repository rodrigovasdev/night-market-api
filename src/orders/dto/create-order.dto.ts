import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsInt, IsOptional, IsPositive, IsString, ValidateNested, Min } from 'class-validator';

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
  @Min(-1)
  userId!: number;

  @IsOptional()
  @IsString()
  discount?: string;

  // Guest fields (required when userId === -1)
  @IsOptional()
  @IsString()
  guestName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
