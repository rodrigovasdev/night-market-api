import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendDiscountDto } from './dto/send-discount.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('discount')
  sendDiscount(@Body() sendDiscountDto: SendDiscountDto) {
    return this.mailService.sendDiscountCode(sendDiscountDto);
  }
}
