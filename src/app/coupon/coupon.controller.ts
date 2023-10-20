import { Body, Controller, Post } from '@nestjs/common';
import { Coupon } from '../entities/Coupon';
import { CouponService } from './coupon.service';
import { CouponRedeemDto } from './dto/input.dto';

@Controller()
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('/coupon-redeem')
  async couponRedeem(
    @Body() couponRedeemDto: CouponRedeemDto,
  ): Promise<Coupon> {
    return await this.couponService.couponRedeem(couponRedeemDto);
  }
}
