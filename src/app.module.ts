import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { SeedModule } from './seed/seed.module';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [UsersModule,
            ProductsModule,
            CategoriesModule,
            SubcategoriesModule,
            SeedModule,
            MailModule,
            OrdersModule,
            ChatModule,
            ConfigModule.forRoot({
              isGlobal: true,
            }),

            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (configService: ConfigService) => {
                const url = configService.get<string>('DB_URL');
                const isLocal = url?.includes('localhost') || url?.includes('127.0.0.1') || url?.includes('@postgres:');
                return {
                  type: 'postgres',
                  url,
                  autoLoadEntities: true,
                  synchronize: true,
                  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
                };
              },
            }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
