import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1697442422795 implements MigrationInterface {
  name = 'Migrations1697442422795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`player\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`reward\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`startDate\` datetime NOT NULL, \`endDate\` datetime NOT NULL, \`perDayLimit\` int NOT NULL, \`totalLimit\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`coupon\` (\`id\` int NOT NULL AUTO_INCREMENT, \`value\` varchar(255) NOT NULL, \`rewardId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`player_coupon\` (\`id\` int NOT NULL AUTO_INCREMENT, \`redeemedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`playerId\` int NULL, \`couponId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon\` ADD CONSTRAINT \`FK_1643b27c7370400bf553b39efd4\` FOREIGN KEY (\`rewardId\`) REFERENCES \`reward\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`player_coupon\` ADD CONSTRAINT \`FK_ae5e8ef8f6f94494fed0ddfc8c6\` FOREIGN KEY (\`playerId\`) REFERENCES \`player\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`player_coupon\` ADD CONSTRAINT \`FK_d5276bd300928230021f6ff5609\` FOREIGN KEY (\`couponId\`) REFERENCES \`coupon\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`player_coupon\` DROP FOREIGN KEY \`FK_d5276bd300928230021f6ff5609\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`player_coupon\` DROP FOREIGN KEY \`FK_ae5e8ef8f6f94494fed0ddfc8c6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon\` DROP FOREIGN KEY \`FK_1643b27c7370400bf553b39efd4\``,
    );
    await queryRunner.query(`DROP TABLE \`player_coupon\``);
    await queryRunner.query(`DROP TABLE \`coupon\``);
    await queryRunner.query(`DROP TABLE \`reward\``);
    await queryRunner.query(`DROP TABLE \`player\``);
  }
}
