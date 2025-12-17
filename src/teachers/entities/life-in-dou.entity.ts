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

@Entity('life_in_dou')
export class LifeInDOU {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teacherId: string;

  @ManyToOne(() => TeacherProfile, (teacher) => teacher.lifeInDOU)
  @JoinColumn({ name: 'teacherId' })
  teacher: TeacherProfile;

  @Column('json', { nullable: true })
  mediaItems: Array<{ type: 'photo' | 'video'; url: string; caption?: string }> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


