import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

async function updatePrices() {
  const configService = new ConfigService();
  const url = process.env.DB_URL || configService.get<string>('DB_URL');

  if (!url) {
    console.error('DB_URL is not set in environment variables');
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url,
    // autoLoadEntities: true,
    synchronize: false,
    ssl: {
      rejectUnauthorized: false,
    },
    entities: ['src/**/entities/*.ts'],
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Execute the UPDATE query
    const result = await dataSource.query(
      `UPDATE product SET price = FLOOR(price * 1000)`,
    );

    console.log(`✅ Update completed. Rows affected: ${result[1] || 'Check database'}`);
    console.log('All product prices have been multiplied by 1000 with decimals removed');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  }
}

updatePrices();
