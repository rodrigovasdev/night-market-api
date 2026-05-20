import { IsEmail, IsInt, IsPositive, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  stars!: number;

  @IsString()
  reviewText!: string;
}
