import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { Post } from './entities/post.entity';
import { MasterClass } from './entities/master-class.entity';
import { Presentation } from './entities/presentation.entity';
import { ParentSection } from './entities/parent-section.entity';
import { LifeInDOU } from './entities/life-in-dou.entity';
import { SocialLink } from './entities/social-link.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateMasterClassDto } from './dto/create-master-class.dto';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { CreateParentSectionDto } from './dto/create-parent-section.dto';
import { CreateLifeInDOUDto } from './dto/create-life-in-dou.dto';
import { AddSocialLinkDto } from './dto/add-social-link.dto';
import { UsersService } from '../users/users.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeacherProfile)
    private teacherProfileRepository: Repository<TeacherProfile>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(MasterClass)
    private masterClassRepository: Repository<MasterClass>,
    @InjectRepository(Presentation)
    private presentationRepository: Repository<Presentation>,
    @InjectRepository(ParentSection)
    private parentSectionRepository: Repository<ParentSection>,
    @InjectRepository(LifeInDOU)
    private lifeInDOURepository: Repository<LifeInDOU>,
    @InjectRepository(SocialLink)
    private socialLinkRepository: Repository<SocialLink>,
    private usersService: UsersService,
    private uploadService: UploadService,
  ) {}

  async getPublicProfile(username: string): Promise<TeacherProfile> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('Teacher not found');
    }

    const profile = await this.teacherProfileRepository.findOne({
      where: { userId: user.id },
      relations: ['socialLinks', 'user'],
    });

    if (!profile) {
      throw new NotFoundException('Teacher profile not found');
    }

    return profile;
  }

  async getOwnProfile(userId: string): Promise<TeacherProfile> {
    const profile = await this.teacherProfileRepository.findOne({
      where: { userId },
      relations: ['socialLinks', 'user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    updateDto: UpdateProfileDto,
  ): Promise<TeacherProfile> {
    const profile = await this.getOwnProfile(userId);
    Object.assign(profile, updateDto);
    return this.teacherProfileRepository.save(profile);
  }

  // Posts
  async getPosts(teacherId: string): Promise<Post[]> {
    return this.postRepository.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async createPost(teacherId: string, createDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      ...createDto,
      teacherId,
    });
    return this.postRepository.save(post);
  }

  async updatePost(
    postId: string,
    teacherId: string,
    updateDto: Partial<CreatePostDto>,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId, teacherId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    Object.assign(post, updateDto);
    return this.postRepository.save(post);
  }

  async deletePost(postId: string, teacherId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId, teacherId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Удаляем все связанные файлы
    const filesToDelete: string[] = [];
    
    if (post.images && post.images.length > 0) {
      filesToDelete.push(...post.images);
    }
    
    if (post.videos && post.videos.length > 0) {
      filesToDelete.push(...post.videos);
    }
    
    if (post.coverImage) {
      filesToDelete.push(post.coverImage);
    }

    // Удаляем файлы параллельно
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }

    await this.postRepository.remove(post);
  }

  // Master Classes
  async getMasterClasses(teacherId: string): Promise<MasterClass[]> {
    return this.masterClassRepository.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async createMasterClass(
    teacherId: string,
    createDto: CreateMasterClassDto,
  ): Promise<MasterClass> {
    const masterClass = this.masterClassRepository.create({
      ...createDto,
      teacherId,
    });
    return this.masterClassRepository.save(masterClass);
  }

  async updateMasterClass(
    id: string,
    teacherId: string,
    updateDto: Partial<CreateMasterClassDto>,
  ): Promise<MasterClass> {
    const masterClass = await this.masterClassRepository.findOne({
      where: { id, teacherId },
    });
    if (!masterClass) {
      throw new NotFoundException('Master class not found');
    }
    Object.assign(masterClass, updateDto);
    return this.masterClassRepository.save(masterClass);
  }

  async deleteMasterClass(id: string, teacherId: string): Promise<void> {
    const masterClass = await this.masterClassRepository.findOne({
      where: { id, teacherId },
    });
    if (!masterClass) {
      throw new NotFoundException('Master class not found');
    }

    // Удаляем все связанные файлы
    const filesToDelete: string[] = [];
    
    if (masterClass.images && masterClass.images.length > 0) {
      filesToDelete.push(...masterClass.images);
    }
    
    if (masterClass.videos && masterClass.videos.length > 0) {
      filesToDelete.push(...masterClass.videos);
    }
    
    if (masterClass.coverImage) {
      filesToDelete.push(masterClass.coverImage);
    }

    // Удаляем файлы параллельно
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }

    await this.masterClassRepository.remove(masterClass);
  }

  // Presentations
  async getPresentations(teacherId: string): Promise<Presentation[]> {
    return this.presentationRepository.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async createPresentation(
    teacherId: string,
    createDto: CreatePresentationDto,
  ): Promise<Presentation> {
    const presentation = this.presentationRepository.create({
      ...createDto,
      teacherId,
    });
    return this.presentationRepository.save(presentation);
  }

  async updatePresentation(
    id: string,
    teacherId: string,
    updateDto: Partial<CreatePresentationDto>,
  ): Promise<Presentation> {
    const presentation = await this.presentationRepository.findOne({
      where: { id, teacherId },
    });
    if (!presentation) {
      throw new NotFoundException('Presentation not found');
    }
    Object.assign(presentation, updateDto);
    return this.presentationRepository.save(presentation);
  }

  async deletePresentation(id: string, teacherId: string): Promise<void> {
    const presentation = await this.presentationRepository.findOne({
      where: { id, teacherId },
    });
    if (!presentation) {
      throw new NotFoundException('Presentation not found');
    }

    // Удаляем все связанные файлы
    const filesToDelete: string[] = [];
    
    if (presentation.fileUrl) {
      filesToDelete.push(presentation.fileUrl);
    }
    
    if (presentation.previewImage) {
      filesToDelete.push(presentation.previewImage);
    }
    
    if (presentation.coverImage) {
      filesToDelete.push(presentation.coverImage);
    }

    // Удаляем файлы параллельно
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }

    await this.presentationRepository.remove(presentation);
  }

  // Parent Sections
  async getParentSections(teacherId: string): Promise<ParentSection[]> {
    return this.parentSectionRepository.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async createParentSection(
    teacherId: string,
    createDto: CreateParentSectionDto,
  ): Promise<ParentSection> {
    const parentSection = this.parentSectionRepository.create({
      ...createDto,
      teacherId,
    });
    return this.parentSectionRepository.save(parentSection);
  }

  async updateParentSection(
    id: string,
    teacherId: string,
    updateDto: Partial<CreateParentSectionDto>,
  ): Promise<ParentSection> {
    const parentSection = await this.parentSectionRepository.findOne({
      where: { id, teacherId },
    });
    if (!parentSection) {
      throw new NotFoundException('Parent section not found');
    }
    Object.assign(parentSection, updateDto);
    return this.parentSectionRepository.save(parentSection);
  }

  async deleteParentSection(id: string, teacherId: string): Promise<void> {
    const parentSection = await this.parentSectionRepository.findOne({
      where: { id, teacherId },
    });
    if (!parentSection) {
      throw new NotFoundException('Parent section not found');
    }

    // Удаляем все связанные файлы
    const filesToDelete: string[] = [];
    
    if (parentSection.files && parentSection.files.length > 0) {
      filesToDelete.push(...parentSection.files);
    }
    
    if (parentSection.coverImage) {
      filesToDelete.push(parentSection.coverImage);
    }

    // Удаляем файлы параллельно
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }

    await this.parentSectionRepository.remove(parentSection);
  }

  // Life in DOU - получаем или создаем один объект для учителя
  async getLifeInDOU(teacherId: string): Promise<LifeInDOU> {
    let lifeInDOU = await this.lifeInDOURepository.findOne({
      where: { teacherId },
    });
    
    // Если объекта нет, создаем пустой
    if (!lifeInDOU) {
      lifeInDOU = this.lifeInDOURepository.create({
        teacherId,
        mediaItems: null,
      });
      lifeInDOU = await this.lifeInDOURepository.save(lifeInDOU);
    }
    
    return lifeInDOU;
  }

  async addMediaToLifeInDOU(
    teacherId: string,
    mediaItem: { type: 'photo' | 'video'; url: string; caption?: string },
  ): Promise<LifeInDOU> {
    let lifeInDOU = await this.lifeInDOURepository.findOne({
      where: { teacherId },
    });
    
    // Если объекта нет, создаем новый
    if (!lifeInDOU) {
      lifeInDOU = this.lifeInDOURepository.create({
        teacherId,
        mediaItems: [mediaItem],
      });
    } else {
      // Добавляем новый медиа элемент к существующим
      const existingItems = lifeInDOU.mediaItems || [];
      lifeInDOU.mediaItems = [...existingItems, mediaItem];
    }
    
    return this.lifeInDOURepository.save(lifeInDOU);
  }

  async removeMediaFromLifeInDOU(
    teacherId: string,
    mediaUrl: string,
  ): Promise<LifeInDOU> {
    const lifeInDOU = await this.lifeInDOURepository.findOne({
      where: { teacherId },
    });
    
    if (!lifeInDOU || !lifeInDOU.mediaItems || lifeInDOU.mediaItems.length === 0) {
      throw new NotFoundException('Media item not found');
    }
    
    // Удаляем файл из хранилища
    await this.uploadService.deleteFile(mediaUrl);
    
    // Удаляем медиа элемент по URL
    const filteredItems = lifeInDOU.mediaItems.filter(item => item.url !== mediaUrl);
    
    // Если медиа элементов не осталось, устанавливаем null
    if (filteredItems.length === 0) {
      lifeInDOU.mediaItems = null;
    } else {
      lifeInDOU.mediaItems = filteredItems;
    }
    
    return this.lifeInDOURepository.save(lifeInDOU);
  }

  async deleteLifeInDOU(id: string, teacherId: string): Promise<void> {
    const lifeInDOU = await this.lifeInDOURepository.findOne({
      where: { id, teacherId },
    });
    if (!lifeInDOU) {
      throw new NotFoundException('Life in DOU not found');
    }

    // Удаляем все медиа файлы
    const filesToDelete: string[] = [];
    
    if (lifeInDOU.mediaItems && lifeInDOU.mediaItems.length > 0) {
      filesToDelete.push(...lifeInDOU.mediaItems.map(item => item.url));
    }

    // Удаляем файлы параллельно
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }

    await this.lifeInDOURepository.remove(lifeInDOU);
  }

  // Social Links
  async getSocialLinks(teacherId: string): Promise<SocialLink[]> {
    return this.socialLinkRepository.find({
      where: { teacherId },
      order: { order: 'ASC' },
    });
  }

  async addSocialLink(
    teacherId: string,
    createDto: AddSocialLinkDto,
  ): Promise<SocialLink> {
    const socialLink = this.socialLinkRepository.create({
      ...createDto,
      teacherId,
    });
    return this.socialLinkRepository.save(socialLink);
  }

  async updateSocialLink(
    id: string,
    teacherId: string,
    updateDto: Partial<AddSocialLinkDto>,
  ): Promise<SocialLink> {
    const socialLink = await this.socialLinkRepository.findOne({
      where: { id, teacherId },
    });
    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }
    Object.assign(socialLink, updateDto);
    return this.socialLinkRepository.save(socialLink);
  }

  async deleteSocialLink(id: string, teacherId: string): Promise<void> {
    const socialLink = await this.socialLinkRepository.findOne({
      where: { id, teacherId },
    });
    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }
    await this.socialLinkRepository.remove(socialLink);
  }

  // Get all teachers (public)
  async getAllTeachers(): Promise<TeacherProfile[]> {
    return this.teacherProfileRepository.find({
      relations: ['user', 'socialLinks'],
    });
  }

  // Delete profile and all related data
  async deleteProfile(userId: string): Promise<void> {
    const profile = await this.getOwnProfile(userId);
    const profileId = profile.id;

    // Собираем все файлы для удаления
    const filesToDelete: string[] = [];

    // Собираем файлы из постов
    const posts = await this.postRepository.find({ where: { teacherId: profileId } });
    posts.forEach(post => {
      if (post.images && post.images.length > 0) {
        filesToDelete.push(...post.images);
      }
      if (post.videos && post.videos.length > 0) {
        filesToDelete.push(...post.videos);
      }
      if (post.coverImage) {
        filesToDelete.push(post.coverImage);
      }
    });

    // Собираем файлы из мастер-классов
    const masterClasses = await this.masterClassRepository.find({ where: { teacherId: profileId } });
    masterClasses.forEach(mc => {
      if (mc.images && mc.images.length > 0) {
        filesToDelete.push(...mc.images);
      }
      if (mc.videos && mc.videos.length > 0) {
        filesToDelete.push(...mc.videos);
      }
      if (mc.coverImage) {
        filesToDelete.push(mc.coverImage);
      }
    });

    // Собираем файлы из презентаций
    const presentations = await this.presentationRepository.find({ where: { teacherId: profileId } });
    presentations.forEach(pres => {
      if (pres.fileUrl) {
        filesToDelete.push(pres.fileUrl);
      }
      if (pres.previewImage) {
        filesToDelete.push(pres.previewImage);
      }
      if (pres.coverImage) {
        filesToDelete.push(pres.coverImage);
      }
    });

    // Собираем файлы из разделов для родителей
    const parentSections = await this.parentSectionRepository.find({ where: { teacherId: profileId } });
    parentSections.forEach(ps => {
      if (ps.files && ps.files.length > 0) {
        filesToDelete.push(...ps.files);
      }
      if (ps.coverImage) {
        filesToDelete.push(ps.coverImage);
      }
    });

    // Собираем файлы из LifeInDOU
    const lifeInDOU = await this.lifeInDOURepository.find({ where: { teacherId: profileId } });
    lifeInDOU.forEach(life => {
      if (life.mediaItems && life.mediaItems.length > 0) {
        filesToDelete.push(...life.mediaItems.map(item => item.url));
      }
    });

    // Удаляем фото профиля
    if (profile.photoUrl) {
      filesToDelete.push(profile.photoUrl);
    }

    // Удаляем все файлы параллельно
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }

    // Delete all related data
    if (posts.length > 0) {
      await this.postRepository.remove(posts);
    }

    if (masterClasses.length > 0) {
      await this.masterClassRepository.remove(masterClasses);
    }

    if (presentations.length > 0) {
      await this.presentationRepository.remove(presentations);
    }

    if (parentSections.length > 0) {
      await this.parentSectionRepository.remove(parentSections);
    }

    if (lifeInDOU.length > 0) {
      await this.lifeInDOURepository.remove(lifeInDOU);
    }

    // Delete social links
    const socialLinks = await this.socialLinkRepository.find({ where: { teacherId: profileId } });
    if (socialLinks.length > 0) {
      await this.socialLinkRepository.remove(socialLinks);
    }

    // Delete profile
    await this.teacherProfileRepository.remove(profile);

    // Delete user account
    await this.usersService.delete(userId);
  }
}


