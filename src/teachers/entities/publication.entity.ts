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

@Entity('publications')
export class Publication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teacherId: string;

  @ManyToOne(() => TeacherProfile, (teacher) => teacher.publications)
  @JoinColumn({ name: 'teacherId' })
  teacher: TeacherProfile;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  previewImage: string;

  @Column({ nullable: true })
  cardColor: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  type: string; // 'publication' или 'certificate'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
