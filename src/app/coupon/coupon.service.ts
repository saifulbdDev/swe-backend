import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponRedeemDto } from './dto/input.dto';
import { Reward } from '../entities/Reward';
import { PlayerCoupon } from '../entities/PlayerCoupon';
import { Coupon } from '../entities/Coupon';
import { Between, In, Not, Repository } from 'typeorm';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Reward) private rewardsRepository: Repository<Reward>,
    @InjectRepository(PlayerCoupon)
    private playerCouponRepository: Repository<PlayerCoupon>,
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  /**
   * Redeem a coupon for a player based on the provided coupon redemption data.
   * This function handles the coupon redemption process, including validation and database operations.
   *
   * @param couponRedeemDto - The data for coupon redemption, including playerId and rewardId.
   * @returns A Coupon entity representing the redeemed coupon.
   * @throws BadRequestException if any validation checks fail.
   */
  async couponRedeem(couponRedeemDto: CouponRedeemDto): Promise<Coupon> {
    const { playerId, rewardId } = couponRedeemDto;

    // Validate the reward associated with the provided rewardId.
    const reward = await this.validateReward(rewardId);

    // Validate reward redemption limits for the player (daily and total limits).
    await this.validateRewardLimits(playerId, reward);

    // Check if a valid coupon exists for the reward, and if so, add it to the player's coupons.
    const coupon = await this.validateCoupon(rewardId);
    if (coupon) {
      await this.addPlayerCoupon(playerId, coupon.id);
    }

    // Return the redeemed coupon.
    return coupon;
  }

  /**
   * Validates a reward based on its unique identifier (rewardId) and checks if it's valid and not expired.
   *
   * @param rewardId - The unique identifier of the reward to validate.
   * @returns A Reward entity if the reward is valid and not expired.
   * @throws BadRequestException if the reward is invalid or has expired.
   */
  private async validateReward(rewardId: number): Promise<Reward> {
    // Attempt to retrieve the reward from the database based on the provided rewardId.
    const reward = await this.rewardsRepository.findOne({
      where: {
        id: rewardId,
      },
    });

    // If no reward is found, throw an exception indicating that the reward is invalid.
    if (!reward) {
      throw new BadRequestException('Invalid reward!');
    }

    // Get the current timestamp and compare it to the reward's end date to check if it has expired.
    const now = Date.now();
    const startDate = new Date(reward.startDate).getTime();
    const endDate = new Date(reward.endDate).getTime();

    // If the reward not started, throw an exception indicating that it has not started.
    if (startDate > now) {
      throw new BadRequestException('Reward has not started!');
    }

    // If the reward has expired, throw an exception indicating that it has expired.
    if (now > endDate) {
      throw new BadRequestException('Reward has expired!');
    }

    // Return the validated reward entity if it is valid and not expired.
    return reward;
  }

  /**
   * Validates reward redemption limits for a player, including daily and total redemption limits.
   *
   * @param playerId - The unique identifier of the player whose redemption limits are being validated.
   * @param reward - The reward for which redemption limits are checked.
   * @throws BadRequestException if the daily or total redemption limits are exceeded.
   */
  private async validateRewardLimits(
    playerId: number,
    reward: Reward,
  ): Promise<void> {
    // Get the current date and time using the 'moment' library.
    const now = moment();

    // Calculate the start and end times of the current day (midnight to just before midnight).
    const startOfDay = now.startOf('day').toDate();
    const endOfDay = now.endOf('day').toDate();

    // Count the number of redemptions by the player on the current day.
    const dailyRedeem = await this.playerCouponRepository.count({
      where: {
        player: {
          id: playerId,
        },
        coupon: {
          Reward: {
            id: reward.id,
          },
        },
        redeemedAt: Between(startOfDay, endOfDay),
      },
    });

    // Check if the daily redemption limit is exceeded. If so, throw an exception.
    if (dailyRedeem >= reward.perDayLimit) {
      throw new BadRequestException('Daily reward limit exceeded!');
    }

    // Count the total number of redemptions by the player.
    const totalRedeem = await this.playerCouponRepository.count({
      where: {
        player: {
          id: playerId,
        },
        coupon: {
          Reward: {
            id: reward.id,
          },
        },
      },
    });

    // Check if the total redemption limit is exceeded. If so, throw an exception.
    if (totalRedeem >= reward.totalLimit) {
      throw new BadRequestException('Total reward limit exceeded!');
    }
  }

  /**
   * Validates a coupon for a specific reward based on the provided rewardId.
   *
   * @param rewardId - The unique identifier of the reward for which the coupon is being validated.
   * @returns A Coupon entity if the coupon is valid and not already used.
   * @throws BadRequestException if the coupon is not found for the reward or is already used.
   */
  private async validateCoupon(rewardId: number): Promise<Coupon> {
    // Attempt to retrieve a coupon for the specified reward from the database.

    const usedCoupon =
      (
        await this.playerCouponRepository.find({
          select: { id: true },
        })
      )?.map((item) => item.id) ?? [];

    const coupon = await this.couponRepository.findOne({
      where: {
        id: Not(In(usedCoupon)),
        Reward: {
          id: rewardId,
        },
      },
    });

    // If no coupon is found for the reward, throw an exception indicating that it's not found.
    if (!coupon) {
      throw new BadRequestException('Coupon not found for this reward');
    }

    // Return the validated coupon entity if it is valid and not already used.
    return coupon;
  }

  /**
   * Creates a new PlayerCoupon record to associate a player with a coupon.
   *
   * @param playerId - The unique identifier of the player to associate with the coupon.
   * @param couponId - The unique identifier of the coupon to associate with the player.
   */
  private async addPlayerCoupon(
    playerId: number,
    couponId: number,
  ): Promise<void> {
    // Create a new PlayerCoupon entity to link the player and the coupon.
    const playerCoupon = this.playerCouponRepository.create({
      player: { id: playerId },
      coupon: { id: couponId },
    });

    // Persist the newly created PlayerCoupon entity to the database.
    await this.playerCouponRepository.save(playerCoupon);
  }
}
