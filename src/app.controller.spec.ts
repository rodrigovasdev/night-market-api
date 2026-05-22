import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should return keep alive status', () => {
      const keepAlive = appController.getKeepAlive();

      expect(keepAlive.status).toBe('alive');
      expect(keepAlive.service).toBe('night-market-api');
      expect(typeof keepAlive.timestamp).toBe('string');
    });
  });
});
