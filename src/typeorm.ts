import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Coupon } from './app/entities/Coupon';
import { Player } from './app/entities/Player';
import { PlayerCoupon } from './app/entities/PlayerCoupon';
import { Reward } from './app/entities/Reward';

dotenvConfig({ path: '.env' });

const config = {
  type: 'mysql',
  host: `${process.env.TYPEORM_HOST}`,
  port: `${process.env.TYPEORM_PORT}`,
  username: `${process.env.TYPEORM_USERNAME}`,
  password: `${process.env.TYPEORM_PASSWORD}`,
  database: `${process.env.TYPEORM_DATABASE}`,
  entities: [Player, Reward, Coupon, PlayerCoupon],
  migrations: process.env.typeorm === 'true' ? ['migrations/*.ts'] : [],
  autoLoadEntities: true,
  synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
