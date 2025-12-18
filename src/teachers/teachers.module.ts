import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { Post } from './entities/post.entity';
import { MasterClass } from './entities/master-class.entity';
import { Presentation } from './entities/presentation.entity';
import { ParentSection } from './entities/parent-section.entity';
import { LifeInDOU } from './entities/life-in-dou.entity';
import { SocialLink } from './entities/social-link.entity';
import { UsersModule } from '../users/users.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeacherProfile,
      Post,
      MasterClass,
      Presentation,
      ParentSection,
      LifeInDOU,
      SocialLink,
    ]),
    UsersModule,
    UploadModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}



