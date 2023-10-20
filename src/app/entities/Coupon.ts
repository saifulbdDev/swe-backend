import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Reward } from './Reward';
@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @ManyToOne(() => Reward, { nullable: true })
  Reward?: Reward;
}
