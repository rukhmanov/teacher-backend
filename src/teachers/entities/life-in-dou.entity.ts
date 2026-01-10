import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TeacherProfile } from './teacher-profile.entity';
import { Folder } from './folder.entity';

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

  @OneToMany(() => Folder, (folder) => folder.lifeInDOU)
  folders: Folder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}




