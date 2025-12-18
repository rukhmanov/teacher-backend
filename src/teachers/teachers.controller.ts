import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateMasterClassDto } from './dto/create-master-class.dto';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { CreateParentSectionDto } from './dto/create-parent-section.dto';
import { CreateLifeInDOUDto } from './dto/create-life-in-dou.dto';
import { AddSocialLinkDto } from './dto/add-social-link.dto';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // Public endpoints
  @Get()
  async getAllTeachers() {
    return this.teachersService.getAllTeachers();
  }

  // Protected endpoints (own profile) - MUST come before :username routes
  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getOwnProfile(@Request() req) {
    return this.teachersService.getOwnProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  async updateProfile(
    @Request() req,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.teachersService.updateProfile(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/profile')
  async deleteProfile(@Request() req) {
    await this.teachersService.deleteProfile(req.user.id);
    return { message: 'Profile deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/posts')
  async getOwnPosts(@Request() req) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.getPosts(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/master-classes')
  async getOwnMasterClasses(@Request() req) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.getMasterClasses(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/presentations')
  async getOwnPresentations(@Request() req) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.getPresentations(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/parents')
  async getOwnParentSections(@Request() req) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.getParentSections(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/life')
  async getOwnLifeInDOU(@Request() req) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.getLifeInDOU(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/social-links')
  async getOwnSocialLinks(@Request() req) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.getSocialLinks(profile.id);
  }

  // Public profile routes (with :username parameter)
  @Get(':username')
  async getPublicProfile(@Param('username') username: string) {
    return this.teachersService.getPublicProfile(username);
  }

  // Posts
  @Get(':username/posts')
  async getPosts(@Param('username') username: string) {
    const profile = await this.teachersService.getPublicProfile(username);
    return this.teachersService.getPosts(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/posts')
  async createPost(@Request() req, @Body() createDto: CreatePostDto) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.createPost(profile.id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/posts/:id')
  async updatePost(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: CreatePostDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.updatePost(id, profile.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/posts/:id')
  async deletePost(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.deletePost(id, profile.id);
  }

  // Master Classes
  @Get(':username/master-classes')
  async getMasterClasses(@Param('username') username: string) {
    const profile = await this.teachersService.getPublicProfile(username);
    return this.teachersService.getMasterClasses(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/master-classes')
  async createMasterClass(
    @Request() req,
    @Body() createDto: CreateMasterClassDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.createMasterClass(profile.id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/master-classes/:id')
  async updateMasterClass(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: CreateMasterClassDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.updateMasterClass(id, profile.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/master-classes/:id')
  async deleteMasterClass(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.deleteMasterClass(id, profile.id);
  }

  // Presentations
  @Get(':username/presentations')
  async getPresentations(@Param('username') username: string) {
    const profile = await this.teachersService.getPublicProfile(username);
    return this.teachersService.getPresentations(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/presentations')
  async createPresentation(
    @Request() req,
    @Body() createDto: CreatePresentationDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.createPresentation(profile.id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/presentations/:id')
  async updatePresentation(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: CreatePresentationDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.updatePresentation(id, profile.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/presentations/:id')
  async deletePresentation(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.deletePresentation(id, profile.id);
  }

  // Parent Sections
  @Get(':username/parents')
  async getParentSections(@Param('username') username: string) {
    const profile = await this.teachersService.getPublicProfile(username);
    return this.teachersService.getParentSections(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/parents')
  async createParentSection(
    @Request() req,
    @Body() createDto: CreateParentSectionDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.createParentSection(profile.id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/parents/:id')
  async updateParentSection(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: CreateParentSectionDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.updateParentSection(id, profile.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/parents/:id')
  async deleteParentSection(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.deleteParentSection(id, profile.id);
  }

  // Life in DOU
  @Get(':username/life')
  async getLifeInDOU(@Param('username') username: string) {
    const profile = await this.teachersService.getPublicProfile(username);
    return this.teachersService.getLifeInDOU(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/life/media')
  async addMediaToLifeInDOU(
    @Request() req,
    @Body() mediaItem: { type: 'photo' | 'video'; url: string; caption?: string },
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.addMediaToLifeInDOU(profile.id, mediaItem);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/life/media')
  async removeMediaFromLifeInDOU(
    @Request() req,
    @Body() body: { url: string },
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.removeMediaFromLifeInDOU(profile.id, body.url);
  }

  // Social Links
  @Get(':username/social-links')
  async getSocialLinks(@Param('username') username: string) {
    const profile = await this.teachersService.getPublicProfile(username);
    return this.teachersService.getSocialLinks(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/social-links')
  async addSocialLink(@Request() req, @Body() createDto: AddSocialLinkDto) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.addSocialLink(profile.id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/social-links/:id')
  async updateSocialLink(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: AddSocialLinkDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.updateSocialLink(id, profile.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/social-links/:id')
  async deleteSocialLink(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.deleteSocialLink(id, profile.id);
  }
}



