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

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teacherId: string;

  @ManyToOne(() => TeacherProfile, (teacher) => teacher.posts)
  @JoinColumn({ name: 'teacherId' })
  teacher: TeacherProfile;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('simple-array', { nullable: true })
  videos: string[];

  @Column({ nullable: true })
  cardColor: string;

  @Column({ nullable: true })
  coverImage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


