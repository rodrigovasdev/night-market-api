import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('keep-alive')
  getKeepAlive() {
    return {
      status: 'alive',
      service: 'night-market-api',
      timestamp: new Date().toISOString(),
    };
  }
}
