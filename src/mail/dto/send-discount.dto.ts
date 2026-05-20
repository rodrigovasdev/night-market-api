import { IsEmail, IsString, MinLength } from 'class-validator';

export class SendDiscountDto {
  @IsString()
  @MinLength(2)
  username!: string;

  @IsEmail()
  email!: string;
}
