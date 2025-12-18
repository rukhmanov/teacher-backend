import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { WhitelistEmail } from './entities/whitelist-email.entity';
import { TeacherProfile } from '../teachers/entities/teacher-profile.entity';
import { TeachersModule } from '../teachers/teachers.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhitelistEmail, TeacherProfile]),
    TeachersModule,
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}



