import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/roles';
import { UpdateProfileDto } from '../teachers/dto/update-profile.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('teachers')
  async getAllTeachers() {
    return this.adminService.getAllTeachers();
  }

  @Put('teachers/:id')
  async updateTeacher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.adminService.updateTeacher(id, updateDto);
  }

  @Get('whitelist')
  async getWhitelist() {
    return this.adminService.getWhitelist();
  }

  @Post('whitelist')
  async addToWhitelist(@Request() req, @Body() body: { email: string }) {
    return this.adminService.addToWhitelist(body.email, req.user.id);
  }

  @Delete('whitelist/:id')
  async removeFromWhitelist(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.removeFromWhitelist(id);
  }

  @Delete('teachers/:id')
  async deleteTeacher(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteTeacher(id);
    return { message: 'Teacher deleted successfully' };
  }
}




