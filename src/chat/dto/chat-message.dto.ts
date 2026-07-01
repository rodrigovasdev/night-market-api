import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message = '';
}