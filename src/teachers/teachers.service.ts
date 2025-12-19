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
import { Publication } from './entities/publication.entity';
import { ParentSection } from './entities/parent-section.entity';
import { LifeInDOU } from './entities/life-in-dou.entity';
import { SocialLink } from './entities/social-link.entity';
import { Review } from './entities/review.entity';
import { Folder } from './entities/folder.entity';
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
    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
    @InjectRepository(ParentSection)
    private parentSectionRepository: Repository<ParentSection>,
    @InjectRepository(LifeInDOU)
    private lifeInDOURepository: Repository<LifeInDOU>,
    @InjectRepository(SocialLink)
    private socialLinkRepository: Repository<SocialLink>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
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
  async getPosts(
    teacherId: string,
    skip?: number,
    take?: number,
  ): Promise<Post[]> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.teacherId = :teacherId', { teacherId })
      .orderBy('post.createdAt', 'DESC');

    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    return queryBuilder.getMany();
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
  async getMasterClasses(
    teacherId: string,
    skip?: number,
    take?: number,
  ): Promise<MasterClass[]> {
    const queryBuilder = this.masterClassRepository
      .createQueryBuilder('masterClass')
      .where('masterClass.teacherId = :teacherId', { teacherId })
      .orderBy('masterClass.createdAt', 'DESC');

    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    return queryBuilder.getMany();
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
  async getPresentations(
    teacherId: string,
    skip?: number,
    take?: number,
  ): Promise<Presentation[]> {
    const queryBuilder = this.presentationRepository
      .createQueryBuilder('presentation')
      .where('presentation.teacherId = :teacherId', { teacherId })
      .orderBy('presentation.createdAt', 'DESC');

    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    return queryBuilder.getMany();
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

  // Publications
  async getPublications(
    teacherId: string,
    skip?: number,
    take?: number,
    type?: string,
  ): Promise<Publication[]> {
    const queryBuilder = this.publicationRepository
      .createQueryBuilder('publication')
      .where('publication.teacherId = :teacherId', { teacherId })
      .orderBy('publication.createdAt', 'DESC');

    // Фильтруем по типу, если указан
    // Если type='publication', показываем только публикации (type='publication' или type IS NULL)
    if (type === 'publication') {
      queryBuilder.andWhere('(publication.type = :type OR publication.type IS NULL)', { type });
    } else if (type) {
      // Для других типов (например, 'certificate') показываем только этот тип
      queryBuilder.andWhere('publication.type = :type', { type });
    }

    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    return queryBuilder.getMany();
  }

  async createPublication(
    teacherId: string,
    createDto: CreatePublicationDto,
  ): Promise<Publication> {
    const publication = this.publicationRepository.create({
      ...createDto,
      teacherId,
    });
    return this.publicationRepository.save(publication);
  }

  async updatePublication(
    id: string,
    teacherId: string,
    updateDto: Partial<CreatePublicationDto>,
  ): Promise<Publication> {
    const publication = await this.publicationRepository.findOne({
      where: { id, teacherId },
    });
    if (!publication) {
      throw new NotFoundException('Publication not found');
    }
    Object.assign(publication, updateDto);
    return this.publicationRepository.save(publication);
  }

  async deletePublication(id: string, teacherId: string): Promise<void> {
    const publication = await this.publicationRepository.findOne({
      where: { id, teacherId },
    });
    if (!publication) {
      throw new NotFoundException('Publication not found');
    }

    // Удаляем все связанные файлы
    const filesToDelete: string[] = [];
    
    if (publication.fileUrl) {
      filesToDelete.push(publication.fileUrl);
    }
    
    if (publication.previewImage) {
      filesToDelete.push(publication.previewImage);
    }
    
    if (publication.coverImage) {
      filesToDelete.push(publication.coverImage);
    }

    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }

    await this.publicationRepository.remove(publication);
  }

  // Parent Sections
  async getParentSections(
    teacherId: string,
    skip?: number,
    take?: number,
  ): Promise<ParentSection[]> {
    const queryBuilder = this.parentSectionRepository
      .createQueryBuilder('parentSection')
      .where('parentSection.teacherId = :teacherId', { teacherId })
      .orderBy('parentSection.createdAt', 'DESC');

    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    return queryBuilder.getMany();
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
    deleteFile: boolean = true,
  ): Promise<LifeInDOU> {
    const lifeInDOU = await this.lifeInDOURepository.findOne({
      where: { teacherId },
    });
    
    if (!lifeInDOU || !lifeInDOU.mediaItems || lifeInDOU.mediaItems.length === 0) {
      throw new NotFoundException('Media item not found');
    }
    
    // Удаляем файл из хранилища только если указано
    if (deleteFile) {
      await this.uploadService.deleteFile(mediaUrl);
    }
    
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

    // Собираем файлы из публикаций
    const publications = await this.publicationRepository.find({ where: { teacherId: profileId } });
    publications.forEach(pub => {
      if (pub.fileUrl) {
        filesToDelete.push(pub.fileUrl);
      }
      if (pub.previewImage) {
        filesToDelete.push(pub.previewImage);
      }
      if (pub.coverImage) {
        filesToDelete.push(pub.coverImage);
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

    if (publications.length > 0) {
      await this.publicationRepository.remove(publications);
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

  // Reviews
  async createReview(teacherId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepository.create({
      teacherId,
      ...createReviewDto,
    });
    return this.reviewRepository.save(review);
  }

  async getReviewsByTeacherId(teacherId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['teacher', 'teacher.user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only the teacher who owns the profile can delete reviews
    if (review.teacher.userId !== userId) {
      throw new ForbiddenException('You can only delete reviews from your own profile');
    }

    await this.reviewRepository.remove(review);
  }

  // Folders
  async createFolder(teacherId: string, createFolderDto: CreateFolderDto): Promise<Folder> {
    let lifeInDOU = await this.lifeInDOURepository.findOne({
      where: { teacherId },
    });

    if (!lifeInDOU) {
      lifeInDOU = this.lifeInDOURepository.create({
        teacherId,
        mediaItems: null,
      });
      lifeInDOU = await this.lifeInDOURepository.save(lifeInDOU);
    }

    const folder = this.folderRepository.create({
      lifeInDOUId: lifeInDOU.id,
      name: createFolderDto.name,
      mediaItems: createFolderDto.mediaItems || null,
    });

    return this.folderRepository.save(folder);
  }

  async getFoldersByTeacherId(teacherId: string): Promise<Folder[]> {
    const lifeInDOU = await this.lifeInDOURepository.findOne({
      where: { teacherId },
    });

    if (!lifeInDOU) {
      return [];
    }

    return this.folderRepository.find({
      where: { lifeInDOUId: lifeInDOU.id },
      order: { createdAt: 'DESC' },
    });
  }

  async addMediaToFolder(folderId: string, mediaItem: { type: 'photo' | 'video'; url: string; caption?: string }): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const existingItems = folder.mediaItems || [];
    folder.mediaItems = [...existingItems, mediaItem];

    return this.folderRepository.save(folder);
  }

  async removeMediaFromFolder(folderId: string, mediaUrl: string, deleteFile: boolean = true): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });

    if (!folder || !folder.mediaItems || folder.mediaItems.length === 0) {
      throw new NotFoundException('Media item not found');
    }

    // Удаляем файл из хранилища только если указано
    if (deleteFile) {
      await this.uploadService.deleteFile(mediaUrl);
    }

    const filteredItems = folder.mediaItems.filter(item => item.url !== mediaUrl);

    if (filteredItems.length === 0) {
      folder.mediaItems = null;
    } else {
      folder.mediaItems = filteredItems;
    }

    return this.folderRepository.save(folder);
  }

  async moveMedia(
    teacherId: string,
    mediaUrl: string,
    sourceFolderId: string | null,
    targetFolderId: string | null,
  ): Promise<void> {
    const mediaItem = await this.findMediaItem(teacherId, mediaUrl, sourceFolderId);
    
    if (!mediaItem) {
      throw new NotFoundException('Media item not found');
    }

    // Удаляем из источника (без удаления файла)
    if (sourceFolderId) {
      await this.removeMediaFromFolder(sourceFolderId, mediaUrl, false);
    } else {
      await this.removeMediaFromLifeInDOU(teacherId, mediaUrl, false);
    }

    // Добавляем в цель
    if (targetFolderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: targetFolderId },
      });
      if (!folder) {
        throw new NotFoundException('Target folder not found');
      }
      const existingItems = folder.mediaItems || [];
      folder.mediaItems = [...existingItems, mediaItem];
      await this.folderRepository.save(folder);
    } else {
      const lifeInDOU = await this.lifeInDOURepository.findOne({
        where: { teacherId },
      });
      if (!lifeInDOU) {
        throw new NotFoundException('LifeInDOU not found');
      }
      const existingItems = lifeInDOU.mediaItems || [];
      lifeInDOU.mediaItems = [...existingItems, mediaItem];
      await this.lifeInDOURepository.save(lifeInDOU);
    }
  }

  private async findMediaItem(
    teacherId: string,
    mediaUrl: string,
    folderId: string | null,
  ): Promise<{ type: 'photo' | 'video'; url: string; caption?: string } | null> {
    if (folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: folderId },
      });
      if (!folder || !folder.mediaItems) {
        return null;
      }
      return folder.mediaItems.find(item => item.url === mediaUrl) || null;
    } else {
      const lifeInDOU = await this.lifeInDOURepository.findOne({
        where: { teacherId },
      });
      if (!lifeInDOU || !lifeInDOU.mediaItems) {
        return null;
      }
      return lifeInDOU.mediaItems.find(item => item.url === mediaUrl) || null;
    }
  }

  async updateFolder(folderId: string, name: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    folder.name = name;
    return this.folderRepository.save(folder);
  }

  async deleteFolder(folderId: string, userId: string): Promise<void> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
      relations: ['lifeInDOU', 'lifeInDOU.teacher', 'lifeInDOU.teacher.user'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (folder.lifeInDOU.teacher.userId !== userId) {
      throw new ForbiddenException('You can only delete folders from your own profile');
    }

    // Delete all media files in the folder
    if (folder.mediaItems) {
      for (const item of folder.mediaItems) {
        await this.uploadService.deleteFile(item.url);
      }
    }

    await this.folderRepository.remove(folder);
  }
}



