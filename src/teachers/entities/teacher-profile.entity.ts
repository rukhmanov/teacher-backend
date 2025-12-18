import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';
import { MasterClass } from './master-class.entity';
import { Presentation } from './presentation.entity';
import { ParentSection } from './parent-section.entity';
import { LifeInDOU } from './life-in-dou.entity';
import { SocialLink } from './social-link.entity';

@Entity('teacher_profiles')
export class TeacherProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  patronymic: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.teacher)
  posts: Post[];

  @OneToMany(() => MasterClass, (masterClass) => masterClass.teacher)
  masterClasses: MasterClass[];

  @OneToMany(() => Presentation, (presentation) => presentation.teacher)
  presentations: Presentation[];

  @OneToMany(() => ParentSection, (parentSection) => parentSection.teacher)
  parentSections: ParentSection[];

  @OneToMany(() => LifeInDOU, (lifeInDOU) => lifeInDOU.teacher)
  lifeInDOU: LifeInDOU[];

  @OneToMany(() => SocialLink, (socialLink) => socialLink.teacher)
  socialLinks: SocialLink[];
}



