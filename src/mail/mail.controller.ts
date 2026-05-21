import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendDiscountDto } from './dto/send-discount.dto';
import { SendKeepInTouchDto } from './dto/send-keep-in-touch.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('discount')
  sendDiscount(@Body() sendDiscountDto: SendDiscountDto) {
    return this.mailService.sendDiscountCode(sendDiscountDto);
  }

  @Post('keep-in-touch')
  sendKeepInTouch(@Body() sendKeepInTouchDto: SendKeepInTouchDto) {
    return this.mailService.sendKeepInTouchEmail(sendKeepInTouchDto);
  }
}
