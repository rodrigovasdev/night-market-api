import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsInt()
  @IsPositive()
  categoryId!: number;
}
