import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TeacherProfile } from './teacher-profile.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teacherId: string;

  @ManyToOne(() => TeacherProfile, (teacher) => teacher.reviews)
  @JoinColumn({ name: 'teacherId' })
  teacher: TeacherProfile;

  @Column()
  authorName: string;

  @Column({ nullable: true })
  authorEmail: string;

  @Column('text')
  content: string;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

