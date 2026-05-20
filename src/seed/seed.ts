import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.runSeed();
    console.log('Seed executed successfully');
  } catch (err) {
    console.error('Error running seed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
