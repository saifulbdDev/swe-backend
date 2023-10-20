import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from '../entities/Coupon';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { Reward } from '../entities/Reward';
import { Player } from '../entities/Player';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Coupon, Reward, PlayerCoupon])],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
