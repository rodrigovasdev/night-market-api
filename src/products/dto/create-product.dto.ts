import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductImageDto {
  @IsUrl()
  url: string;

  @IsBoolean()
  @IsOptional()
  isMain?: boolean;
}

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  shortDescription: string;

  @IsString()
  longDescription: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  @IsOptional()
  images?: CreateProductImageDto[];

  @IsString()
  @IsOptional()
  specifications?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  subcategoryId?: number;
}
