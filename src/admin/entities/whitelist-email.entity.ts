import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('whitelist_emails')
export class WhitelistEmail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  addedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'addedBy' })
  admin: User;

  @CreateDateColumn()
  createdAt: Date;
}




