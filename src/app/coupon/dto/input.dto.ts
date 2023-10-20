import { IsNotEmpty } from 'class-validator';
export class CouponRedeemDto {
  @IsNotEmpty({
    message: 'Player is required',
  })
  playerId: number;

  @IsNotEmpty({
    message: () => 'Reward is required',
  })
  rewardId: number;
}
