import { IsEmail, IsString, MinLength } from 'class-validator';

export class SendKeepInTouchDto {
  @IsString()
  @MinLength(2)
  username!: string;

  @IsEmail()
  email!: string;
}
