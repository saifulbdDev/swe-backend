import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CouponModule } from './coupon/coupon.module';

@Module({
  imports: [CouponModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
