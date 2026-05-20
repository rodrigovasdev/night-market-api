import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Discount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  discount!: string;

  @Column({ default: false })
  isUsed!: boolean;

  @CreateDateColumn({ name: 'date' })
  date!: Date;
}
