import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhitelistEmail } from './entities/whitelist-email.entity';
import { TeachersService } from '../teachers/teachers.service';
import { TeacherProfile } from '../teachers/entities/teacher-profile.entity';
import { UpdateProfileDto } from '../teachers/dto/update-profile.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(WhitelistEmail)
    private whitelistRepository: Repository<WhitelistEmail>,
    @InjectRepository(TeacherProfile)
    private teacherProfileRepository: Repository<TeacherProfile>,
    private teachersService: TeachersService,
  ) {}

  async getAllTeachers(): Promise<TeacherProfile[]> {
    return this.teachersService.getAllTeachers();
  }

  async updateTeacher(
    teacherId: string,
    updateDto: UpdateProfileDto,
  ): Promise<TeacherProfile> {
    const profile = await this.teacherProfileRepository.findOne({
      where: { id: teacherId },
    });
    if (!profile) {
      throw new NotFoundException('Teacher not found');
    }
    Object.assign(profile, updateDto);
    return this.teacherProfileRepository.save(profile);
  }

  async getWhitelist(): Promise<WhitelistEmail[]> {
    return this.whitelistRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async addToWhitelist(
    email: string,
    addedBy: string,
  ): Promise<WhitelistEmail> {
    const existing = await this.whitelistRepository.findOne({
      where: { email },
    });
    if (existing) {
      return existing;
    }

    const whitelistEntry = this.whitelistRepository.create({
      email,
      addedBy,
    });
    return this.whitelistRepository.save(whitelistEntry);
  }

  async removeFromWhitelist(id: string): Promise<void> {
    const entry = await this.whitelistRepository.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Whitelist entry not found');
    }
    await this.whitelistRepository.remove(entry);
  }
}


