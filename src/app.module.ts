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

@Module({
  imports: [UsersModule,
            ProductsModule,
            CategoriesModule,
            SubcategoriesModule,
            SeedModule,
            MailModule,
            OrdersModule,
            ConfigModule.forRoot({
              isGlobal: true,
            }),

            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('DB_URL'),
                autoLoadEntities: true,
                synchronize: true,
                ssl: {
                  rejectUnauthorized: false,
                },
              }),
            }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
