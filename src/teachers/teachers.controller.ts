import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { CreatePublicationDto } from './dto/create-publication.dto';
import { CreateParentSectionDto } from './dto/create-parent-section.dto';
import { CreateLifeInDOUDto } from './dto/create-life-in-dou.dto';
import { AddSocialLinkDto } from './dto/add-social-link.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { MoveMediaDto } from './dto/move-media.dto';

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
  async getOwnPosts(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getPosts(profile.id, skipNum, takeNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/master-classes')
  async getOwnMasterClasses(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getMasterClasses(profile.id, skipNum, takeNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/presentations')
  async getOwnPresentations(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getPresentations(profile.id, skipNum, takeNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/publications')
  async getOwnPublications(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('type') type?: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getPublications(profile.id, skipNum, takeNum, type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/parents')
  async getOwnParentSections(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getParentSections(profile.id, skipNum, takeNum);
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
  async getPosts(
    @Param('username') username: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const profile = await this.teachersService.getPublicProfile(username);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getPosts(profile.id, skipNum, takeNum);
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
  async getMasterClasses(
    @Param('username') username: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const profile = await this.teachersService.getPublicProfile(username);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getMasterClasses(profile.id, skipNum, takeNum);
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
  async getPresentations(
    @Param('username') username: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const profile = await this.teachersService.getPublicProfile(username);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getPresentations(profile.id, skipNum, takeNum);
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

  // Publications
  @UseGuards(JwtAuthGuard)
  @Post('me/publications')
  async createPublication(
    @Request() req,
    @Body() createDto: CreatePublicationDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.createPublication(profile.id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/publications/:id')
  async updatePublication(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: CreatePublicationDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.updatePublication(id, profile.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/publications/:id')
  async deletePublication(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.deletePublication(id, profile.id);
  }

  // Public routes for publications and certificates
  @Get(':username/publications')
  async getPublications(
    @Param('username') username: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('type') type?: string,
  ) {
    const profile = await this.teachersService.getPublicProfile(username);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getPublications(profile.id, skipNum, takeNum, type);
  }

  // Parent Sections
  @Get(':username/parents')
  async getParentSections(
    @Param('username') username: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const profile = await this.teachersService.getPublicProfile(username);
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.teachersService.getParentSections(profile.id, skipNum, takeNum);
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

  // Reviews - Public endpoints
  @Get(':username/reviews')
  async getReviews(@Param('username') username: string) {
    const teacher = await this.teachersService.getPublicProfile(username);
    return this.teachersService.getReviewsByTeacherId(teacher.id);
  }

  @Post(':username/reviews')
  async createReview(
    @Param('username') username: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const teacher = await this.teachersService.getPublicProfile(username);
    return this.teachersService.createReview(teacher.id, createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/reviews/:id')
  async deleteReview(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teachersService.deleteReview(id, req.user.id);
  }

  // Folders - Protected endpoints
  @UseGuards(JwtAuthGuard)
  @Get('me/folders')
  async getOwnFolders(@Request() req) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.getFoldersByTeacherId(profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/folders')
  async createFolder(
    @Request() req,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    return this.teachersService.createFolder(profile.id, createFolderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/folders/:id')
  async updateFolder(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name: string },
  ) {
    return this.teachersService.updateFolder(id, body.name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/folders/:id/media')
  async addMediaToFolder(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { type: 'photo' | 'video'; url: string; caption?: string },
  ) {
    return this.teachersService.addMediaToFolder(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/folders/:id/media')
  async removeMediaFromFolder(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { url: string },
  ) {
    return this.teachersService.removeMediaFromFolder(id, body.url);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/life/move-media')
  async moveMedia(
    @Request() req,
    @Body() body: MoveMediaDto & { sourceFolderId?: string | null; targetFolderId?: string | null },
  ) {
    const profile = await this.teachersService.getOwnProfile(req.user.id);
    await this.teachersService.moveMedia(
      profile.id,
      body.url,
      body.sourceFolderId || null,
      body.targetFolderId || null,
    );
    return { message: 'Media moved successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/folders/:id')
  async deleteFolder(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teachersService.deleteFolder(id, req.user.id);
  }

  // Public endpoints for folders
  @Get(':username/folders')
  async getFolders(@Param('username') username: string) {
    const teacher = await this.teachersService.getPublicProfile(username);
    return this.teachersService.getFoldersByTeacherId(teacher.id);
  }
}



