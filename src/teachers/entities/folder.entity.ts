import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LifeInDOU } from './life-in-dou.entity';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lifeInDOUId: string;

  @ManyToOne(() => LifeInDOU, (lifeInDOU) => lifeInDOU.folders)
  @JoinColumn({ name: 'lifeInDOUId' })
  lifeInDOU: LifeInDOU;

  @Column()
  name: string;

  @Column('json', { nullable: true })
  mediaItems: Array<{ type: 'photo' | 'video'; url: string; caption?: string }> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

