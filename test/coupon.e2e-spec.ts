import { Test, TestingModule } from '@nestjs/testing';

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Reward } from '../src/app/entities/Reward';
import { PlayerCoupon } from '../src/app/entities/PlayerCoupon';
import { Coupon } from '../src/app/entities/Coupon';
import { MainModule } from '../src/main.module';
import { Player } from '../src/app/entities/Player';
import { In } from 'typeorm';

describe('CouponService (E2E)', () => {
  let app: INestApplication;
  let rewardRepository: Repository<Reward>;
  let playerCouponRepository: Repository<PlayerCoupon>;
  let couponRepository: Repository<Coupon>;
  let playerRepository: Repository<Player>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MainModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    playerRepository = moduleFixture.get<Repository<Player>>(
      getRepositoryToken(Player),
    );

    rewardRepository = moduleFixture.get<Repository<Reward>>(
      getRepositoryToken(Reward),
    );
    playerCouponRepository = moduleFixture.get<Repository<PlayerCoupon>>(
      getRepositoryToken(PlayerCoupon),
    );
    couponRepository = moduleFixture.get<Repository<Coupon>>(
      getRepositoryToken(Coupon),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/coupon-redeem (POST)', () => {
    let playerId: number;
    const rewardIds: number[] = [];
    const currentDate = new Date();

    const dateBeforeDay = new Date(currentDate);
    dateBeforeDay.setDate(currentDate.getDate() - 1);

    const dateAferDay = new Date(currentDate);
    dateAferDay.setDate(currentDate.getDate() + 1);

    beforeAll(async () => {
      const player = await playerRepository.save({
        name: 'Sujoy Nath',
      });
      playerId = player.id;
    });

    it('should allow a player to redeem a coupon for a reward', async () => {
      // Create mock data as needed for the test
      const reward = await rewardRepository.save({
        name: 'Airline ticket',
        startDate: dateBeforeDay,
        endDate: dateAferDay,
        perDayLimit: 3,
        totalLimit: 21,
      });

      const rewardId = reward.id;

      rewardIds.push(rewardId);

      const couponData = couponRepository.create({
        Reward: {
          id: rewardId,
        },
        value: '1',
      });
      const coupon = await couponRepository.save(couponData);
      const response = await request(app.getHttpServer())
        .post('/coupon-redeem')
        .send({ playerId, rewardId })
        .expect(201); // Assuming you return HTTP 201 for success

      const data = response.body;

      expect(data.id).toEqual(coupon.id);
      expect(data.value).toEqual(coupon.value);
    });

    it('should restrict a player from redeeming more than 3 coupons in a day', async () => {
      const reward = await rewardRepository.save({
        name: 'Airline ticket',
        startDate: dateBeforeDay,
        endDate: dateAferDay,
        perDayLimit: 3,
        totalLimit: 21,
      });
      const rewardId = reward.id;
      rewardIds.push(rewardId);

      for (let i = 1; i <= 3; i++) {
        const couponData = couponRepository.create({
          Reward: {
            id: rewardId,
          },
          value: '1',
        });
        await couponRepository.save(couponData);
        await request(app.getHttpServer())
          .post('/coupon-redeem')
          .send({ playerId, rewardId });
      }

      const couponData = couponRepository.create({
        Reward: {
          id: rewardId,
        },
        value: '1',
      });
      await couponRepository.save(couponData);

      const response = await request(app.getHttpServer())
        .post('/coupon-redeem')
        .send({ playerId, rewardId })
        .expect(400);

      const errorResponse = response.body;
      expect(errorResponse.message).toBe('Daily reward limit exceeded!');
    });

    it('should restrict a player from redeeming more than 3 coupons', async () => {
      const reward = await rewardRepository.save({
        name: 'Airline ticket',
        startDate: dateBeforeDay,
        endDate: dateAferDay,
        perDayLimit: 6,
        totalLimit: 3,
      });
      const rewardId = reward.id;
      rewardIds.push(rewardId);

      for (let i = 1; i <= 3; i++) {
        const couponData = couponRepository.create({
          Reward: {
            id: rewardId,
          },
          value: '1',
        });
        await couponRepository.save(couponData);
        await request(app.getHttpServer())
          .post('/coupon-redeem')
          .send({ playerId, rewardId });
      }

      const couponData = couponRepository.create({
        Reward: {
          id: rewardId,
        },
        value: '1',
      });
      await couponRepository.save(couponData);

      const response = await request(app.getHttpServer())
        .post('/coupon-redeem')
        .send({ playerId, rewardId })
        .expect(400);

      const errorResponse = response.body;
      expect(errorResponse.message).toBe('Total reward limit exceeded!');
    });

    afterAll(async () => {
      await playerCouponRepository.delete({
        player: {
          id: playerId,
        },
      });
      await couponRepository.delete({
        Reward: {
          id: In(rewardIds),
        },
      });

      await rewardRepository.delete({
        id: In(rewardIds),
      });

      await playerRepository.delete({
        id: playerId,
      });
    });
  });
});
