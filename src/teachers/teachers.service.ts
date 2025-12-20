import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { FilePathUtil } from '../common/utils/file-path.util';

@Injectable()
export class TeachersService {
  private readonly s3Url: string;
  private readonly bucketName: string;
  private readonly oldBucketName = '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc';

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
    private configService: ConfigService,
  ) {
    // Получаем S3 URL из конфигурации
    this.s3Url = this.configService.get<string>('S3_URL')
      || this.configService.get<string>('SWIFT_URL')
      || 'https://s3.twcstorage.ru';
    
    // Получаем текущий bucket name из конфигурации
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME')
      || this.configService.get<string>('SWIFT_BUCKET_NAME')
      || '79dfaf80-vospitatel';
  }

  /**
   * Нормализует путь - извлекает относительный путь из полного URL для сохранения в БД
   */
  private normalizePath(path: string | null | undefined): string | undefined {
    return FilePathUtil.normalizePath(path, this.s3Url);
  }

  /**
   * Нормализует массив путей
   */
  private normalizePaths(paths: string[] | null | undefined): string[] | undefined {
    return FilePathUtil.normalizePaths(paths, this.s3Url);
  }

  /**
   * Формирует полный URL из относительного пути для возврата в API
   * Автоматически заменяет старый bucket name на новый из конфигурации
   */
  private buildFullUrl(path: string | null | undefined): string | null | undefined {
    return FilePathUtil.buildFullUrl(path, this.s3Url, this.bucketName, this.oldBucketName);
  }

  /**
   * Формирует массив полных URL из относительных путей
   * Автоматически заменяет старый bucket name на новый из конфигурации
   */
  private buildFullUrls(paths: string[] | null | undefined): string[] | null | undefined {
    return FilePathUtil.buildFullUrls(paths, this.s3Url, this.bucketName, this.oldBucketName);
  }

  /**
   * Формирует полные URL в объекте TeacherProfile для возврата в API
   */
  private transformProfile(profile: TeacherProfile): TeacherProfile {
    if (profile.photoUrl) {
      profile.photoUrl = this.buildFullUrl(profile.photoUrl) || profile.photoUrl;
    }
    if (profile.videoUrl) {
      profile.videoUrl = this.buildFullUrl(profile.videoUrl) || profile.videoUrl;
    }
    return profile;
  }

  /**
   * Формирует полные URL в объекте Post для возврата в API
   */
  private transformPost(post: Post): Post {
    if (post.images) {
      post.images = this.buildFullUrls(post.images) || post.images;
    }
    if (post.videos) {
      post.videos = this.buildFullUrls(post.videos) || post.videos;
    }
    if (post.files) {
      post.files = this.buildFullUrls(post.files) || post.files;
    }
    if (post.fileUrl) {
      post.fileUrl = this.buildFullUrl(post.fileUrl) || post.fileUrl;
    }
    if (post.coverImage) {
      post.coverImage = this.buildFullUrl(post.coverImage) || post.coverImage;
    }
    return post;
  }

  /**
   * Формирует полные URL в объекте MasterClass для возврата в API
   */
  private transformMasterClass(masterClass: MasterClass): MasterClass {
    if (masterClass.images) {
      masterClass.images = this.buildFullUrls(masterClass.images) || masterClass.images;
    }
    if (masterClass.videos) {
      masterClass.videos = this.buildFullUrls(masterClass.videos) || masterClass.videos;
    }
    if (masterClass.files) {
      masterClass.files = this.buildFullUrls(masterClass.files) || masterClass.files;
    }
    if (masterClass.fileUrl) {
      masterClass.fileUrl = this.buildFullUrl(masterClass.fileUrl) || masterClass.fileUrl;
    }
    if (masterClass.coverImage) {
      masterClass.coverImage = this.buildFullUrl(masterClass.coverImage) || masterClass.coverImage;
    }
    return masterClass;
  }

  /**
   * Формирует полные URL в объекте Presentation для возврата в API
   */
  private transformPresentation(presentation: Presentation): Presentation {
    if (presentation.fileUrl) {
      presentation.fileUrl = this.buildFullUrl(presentation.fileUrl) || presentation.fileUrl;
    }
    if (presentation.coverImage) {
      presentation.coverImage = this.buildFullUrl(presentation.coverImage) || presentation.coverImage;
    }
    if (presentation.previewImage) {
      presentation.previewImage = this.buildFullUrl(presentation.previewImage) || presentation.previewImage;
    }
    return presentation;
  }

  /**
   * Формирует полные URL в объекте Publication для возврата в API
   */
  private transformPublication(publication: Publication): Publication {
    if (publication.fileUrl) {
      publication.fileUrl = this.buildFullUrl(publication.fileUrl) || publication.fileUrl;
    }
    if (publication.coverImage) {
      publication.coverImage = this.buildFullUrl(publication.coverImage) || publication.coverImage;
    }
    if (publication.previewImage) {
      publication.previewImage = this.buildFullUrl(publication.previewImage) || publication.previewImage;
    }
    return publication;
  }

  /**
   * Формирует полные URL в объекте LifeInDOU для возврата в API
   */
  private transformLifeInDOU(lifeInDOU: LifeInDOU): LifeInDOU {
    if (lifeInDOU.mediaItems && Array.isArray(lifeInDOU.mediaItems)) {
      lifeInDOU.mediaItems = lifeInDOU.mediaItems.map(item => ({
        ...item,
        url: this.buildFullUrl(item.url) || item.url,
      }));
    }
    return lifeInDOU;
  }

  /**
   * Формирует полные URL в объекте Folder для возврата в API
   */
  private transformFolder(folder: Folder): Folder {
    if (folder.mediaItems && Array.isArray(folder.mediaItems)) {
      folder.mediaItems = folder.mediaItems.map(item => ({
        ...item,
        url: this.buildFullUrl(item.url) || item.url,
      }));
    }
    return folder;
  }

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

    return this.transformProfile(profile);
  }

  async getOwnProfile(userId: string): Promise<TeacherProfile> {
    const profile = await this.teacherProfileRepository.findOne({
      where: { userId },
      relations: ['socialLinks', 'user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.transformProfile(profile);
  }

  async updateProfile(
    userId: string,
    updateDto: UpdateProfileDto,
  ): Promise<TeacherProfile> {
    const profile = await this.getOwnProfile(userId);
    
    // Удаляем старые файлы, если они заменяются новыми
    const filesToDelete: string[] = [];
    
    if (updateDto.photoUrl !== undefined && updateDto.photoUrl !== profile.photoUrl && profile.photoUrl) {
      filesToDelete.push(profile.photoUrl);
    }
    if (updateDto.videoUrl !== undefined && updateDto.videoUrl !== profile.videoUrl && profile.videoUrl) {
      filesToDelete.push(profile.videoUrl);
    }
    
    // Нормализуем пути перед сохранением
    if (updateDto.photoUrl !== undefined) {
      updateDto.photoUrl = this.normalizePath(updateDto.photoUrl) || updateDto.photoUrl;
    }
    if (updateDto.videoUrl !== undefined) {
      updateDto.videoUrl = this.normalizePath(updateDto.videoUrl) || updateDto.videoUrl;
    }
    
    // Удаляем старые файлы
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }
    
    Object.assign(profile, updateDto);
    const saved = await this.teacherProfileRepository.save(profile);
    return this.transformProfile(saved);
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

    const posts = await queryBuilder.getMany();
    return posts.map(post => this.transformPost(post));
  }

  async createPost(teacherId: string, createDto: CreatePostDto): Promise<Post> {
    // Нормализуем пути перед сохранением
    const normalizedDto = {
      ...createDto,
      images: this.normalizePaths(createDto.images),
      videos: this.normalizePaths(createDto.videos),
      files: this.normalizePaths(createDto.files),
      fileUrl: this.normalizePath(createDto.fileUrl),
      coverImage: this.normalizePath(createDto.coverImage),
    };
    
    const post = this.postRepository.create({
      ...normalizedDto,
      teacherId,
    });
    const saved = await this.postRepository.save(post);
    return this.transformPost(saved);
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
    
    // Удаляем старые файлы, если они заменяются новыми
    const filesToDelete: string[] = [];
    
    if (updateDto.images !== undefined && updateDto.images !== post.images) {
      // Находим файлы, которые были удалены
      const oldImages = post.images || [];
      const newImages = updateDto.images || [];
      const removedImages = oldImages.filter(img => !newImages.includes(img));
      filesToDelete.push(...removedImages);
    }
    
    if (updateDto.videos !== undefined && updateDto.videos !== post.videos) {
      const oldVideos = post.videos || [];
      const newVideos = updateDto.videos || [];
      const removedVideos = oldVideos.filter(vid => !newVideos.includes(vid));
      filesToDelete.push(...removedVideos);
    }
    
    if (updateDto.files !== undefined && updateDto.files !== post.files) {
      const oldFiles = post.files || [];
      const newFiles = updateDto.files || [];
      const removedFiles = oldFiles.filter(file => !newFiles.includes(file));
      filesToDelete.push(...removedFiles);
    }
    
    if (updateDto.fileUrl !== undefined && updateDto.fileUrl !== post.fileUrl && post.fileUrl) {
      filesToDelete.push(post.fileUrl);
    }
    
    if (updateDto.coverImage !== undefined && updateDto.coverImage !== post.coverImage && post.coverImage) {
      filesToDelete.push(post.coverImage);
    }
    
    // Нормализуем пути перед сохранением
    if (updateDto.images !== undefined) {
      updateDto.images = this.normalizePaths(updateDto.images);
    }
    if (updateDto.videos !== undefined) {
      updateDto.videos = this.normalizePaths(updateDto.videos);
    }
    if (updateDto.files !== undefined) {
      updateDto.files = this.normalizePaths(updateDto.files);
    }
    if (updateDto.fileUrl !== undefined) {
      updateDto.fileUrl = this.normalizePath(updateDto.fileUrl);
    }
    if (updateDto.coverImage !== undefined) {
      updateDto.coverImage = this.normalizePath(updateDto.coverImage);
    }
    
    // Удаляем старые файлы
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }
    
    Object.assign(post, updateDto);
    const saved = await this.postRepository.save(post);
    return this.transformPost(saved);
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
    
    if (post.files && post.files.length > 0) {
      filesToDelete.push(...post.files);
    }
    
    if (post.fileUrl) {
      filesToDelete.push(post.fileUrl);
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

    const masterClasses = await queryBuilder.getMany();
    return masterClasses.map(mc => this.transformMasterClass(mc));
  }

  async createMasterClass(
    teacherId: string,
    createDto: CreateMasterClassDto,
  ): Promise<MasterClass> {
    // Нормализуем пути перед сохранением
    const normalizedDto = {
      ...createDto,
      images: this.normalizePaths(createDto.images),
      videos: this.normalizePaths(createDto.videos),
      files: this.normalizePaths(createDto.files),
      fileUrl: this.normalizePath(createDto.fileUrl),
      coverImage: this.normalizePath(createDto.coverImage),
    };
    
    const masterClass = this.masterClassRepository.create({
      ...normalizedDto,
      teacherId,
    });
    const saved = await this.masterClassRepository.save(masterClass);
    return this.transformMasterClass(saved);
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
    
    // Удаляем старые файлы, если они заменяются новыми
    const filesToDelete: string[] = [];
    
    if (updateDto.images !== undefined && updateDto.images !== masterClass.images) {
      const oldImages = masterClass.images || [];
      const newImages = updateDto.images || [];
      const removedImages = oldImages.filter(img => !newImages.includes(img));
      filesToDelete.push(...removedImages);
    }
    
    if (updateDto.videos !== undefined && updateDto.videos !== masterClass.videos) {
      const oldVideos = masterClass.videos || [];
      const newVideos = updateDto.videos || [];
      const removedVideos = oldVideos.filter(vid => !newVideos.includes(vid));
      filesToDelete.push(...removedVideos);
    }
    
    if (updateDto.files !== undefined && updateDto.files !== masterClass.files) {
      const oldFiles = masterClass.files || [];
      const newFiles = updateDto.files || [];
      const removedFiles = oldFiles.filter(file => !newFiles.includes(file));
      filesToDelete.push(...removedFiles);
    }
    
    if (updateDto.fileUrl !== undefined && updateDto.fileUrl !== masterClass.fileUrl && masterClass.fileUrl) {
      filesToDelete.push(masterClass.fileUrl);
    }
    
    if (updateDto.coverImage !== undefined && updateDto.coverImage !== masterClass.coverImage && masterClass.coverImage) {
      filesToDelete.push(masterClass.coverImage);
    }
    
    // Нормализуем пути перед сохранением
    if (updateDto.images !== undefined) {
      updateDto.images = this.normalizePaths(updateDto.images);
    }
    if (updateDto.videos !== undefined) {
      updateDto.videos = this.normalizePaths(updateDto.videos);
    }
    if (updateDto.files !== undefined) {
      updateDto.files = this.normalizePaths(updateDto.files);
    }
    if (updateDto.fileUrl !== undefined) {
      updateDto.fileUrl = this.normalizePath(updateDto.fileUrl);
    }
    if (updateDto.coverImage !== undefined) {
      updateDto.coverImage = this.normalizePath(updateDto.coverImage);
    }
    
    // Удаляем старые файлы
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }
    
    Object.assign(masterClass, updateDto);
    const saved = await this.masterClassRepository.save(masterClass);
    return this.transformMasterClass(saved);
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
    
    if (masterClass.files && masterClass.files.length > 0) {
      filesToDelete.push(...masterClass.files);
    }
    
    if (masterClass.fileUrl) {
      filesToDelete.push(masterClass.fileUrl);
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

    const presentations = await queryBuilder.getMany();
    return presentations.map(p => this.transformPresentation(p));
  }

  async createPresentation(
    teacherId: string,
    createDto: CreatePresentationDto,
  ): Promise<Presentation> {
    // Нормализуем пути перед сохранением
    const normalizedDto = {
      ...createDto,
      fileUrl: this.normalizePath(createDto.fileUrl),
      coverImage: this.normalizePath(createDto.coverImage),
      previewImage: this.normalizePath(createDto.previewImage),
    };
    
    const presentation = this.presentationRepository.create({
      ...normalizedDto,
      teacherId,
    });
    const saved = await this.presentationRepository.save(presentation);
    return this.transformPresentation(saved);
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
    
    // Удаляем старые файлы, если они заменяются новыми
    const filesToDelete: string[] = [];
    
    if (updateDto.fileUrl !== undefined && updateDto.fileUrl !== presentation.fileUrl && presentation.fileUrl) {
      filesToDelete.push(presentation.fileUrl);
    }
    if (updateDto.coverImage !== undefined && updateDto.coverImage !== presentation.coverImage && presentation.coverImage) {
      filesToDelete.push(presentation.coverImage);
    }
    if (updateDto.previewImage !== undefined && updateDto.previewImage !== presentation.previewImage && presentation.previewImage) {
      filesToDelete.push(presentation.previewImage);
    }
    
    // Нормализуем пути перед сохранением
    if (updateDto.fileUrl !== undefined) {
      updateDto.fileUrl = this.normalizePath(updateDto.fileUrl);
    }
    if (updateDto.coverImage !== undefined) {
      updateDto.coverImage = this.normalizePath(updateDto.coverImage);
    }
    if (updateDto.previewImage !== undefined) {
      updateDto.previewImage = this.normalizePath(updateDto.previewImage);
    }
    
    // Удаляем старые файлы
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }
    
    Object.assign(presentation, updateDto);
    const saved = await this.presentationRepository.save(presentation);
    return this.transformPresentation(saved);
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

    const publications = await queryBuilder.getMany();
    return publications.map(p => this.transformPublication(p));
  }

  // Certificates
  async getCertificates(
    teacherId: string,
    skip?: number,
    take?: number,
  ): Promise<Publication[]> {
    const queryBuilder = this.publicationRepository
      .createQueryBuilder('publication')
      .where('publication.teacherId = :teacherId', { teacherId })
      .andWhere('publication.type = :type', { type: 'certificate' })
      .orderBy('publication.createdAt', 'DESC');

    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    const certificates = await queryBuilder.getMany();
    return certificates.map(c => this.transformPublication(c));
  }

  async createPublication(
    teacherId: string,
    createDto: CreatePublicationDto,
  ): Promise<Publication> {
    // Нормализуем пути перед сохранением
    const normalizedDto = {
      ...createDto,
      fileUrl: this.normalizePath(createDto.fileUrl),
      coverImage: this.normalizePath(createDto.coverImage),
      previewImage: this.normalizePath(createDto.previewImage),
    };
    
    const publication = this.publicationRepository.create({
      ...normalizedDto,
      teacherId,
    });
    const saved = await this.publicationRepository.save(publication);
    return this.transformPublication(saved);
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
    
    // Удаляем старые файлы, если они заменяются новыми
    const filesToDelete: string[] = [];
    
    if (updateDto.fileUrl !== undefined && updateDto.fileUrl !== publication.fileUrl && publication.fileUrl) {
      filesToDelete.push(publication.fileUrl);
    }
    if (updateDto.coverImage !== undefined && updateDto.coverImage !== publication.coverImage && publication.coverImage) {
      filesToDelete.push(publication.coverImage);
    }
    if (updateDto.previewImage !== undefined && updateDto.previewImage !== publication.previewImage && publication.previewImage) {
      filesToDelete.push(publication.previewImage);
    }
    
    // Нормализуем пути перед сохранением
    if (updateDto.fileUrl !== undefined) {
      updateDto.fileUrl = this.normalizePath(updateDto.fileUrl);
    }
    if (updateDto.coverImage !== undefined) {
      updateDto.coverImage = this.normalizePath(updateDto.coverImage);
    }
    if (updateDto.previewImage !== undefined) {
      updateDto.previewImage = this.normalizePath(updateDto.previewImage);
    }
    
    // Удаляем старые файлы
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
    }
    
    Object.assign(publication, updateDto);
    const saved = await this.publicationRepository.save(publication);
    return this.transformPublication(saved);
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
    
    // Удаляем старые файлы, если они заменяются новыми
    const filesToDelete: string[] = [];
    
    if (updateDto.files !== undefined && updateDto.files !== parentSection.files) {
      const oldFiles = parentSection.files || [];
      const newFiles = updateDto.files || [];
      const removedFiles = oldFiles.filter(file => !newFiles.includes(file));
      filesToDelete.push(...removedFiles);
    }
    
    if (updateDto.coverImage !== undefined && updateDto.coverImage !== parentSection.coverImage && parentSection.coverImage) {
      filesToDelete.push(parentSection.coverImage);
    }
    
    // Нормализуем пути перед сохранением
    if (updateDto.files !== undefined) {
      updateDto.files = this.normalizePaths(updateDto.files);
    }
    if (updateDto.coverImage !== undefined) {
      updateDto.coverImage = this.normalizePath(updateDto.coverImage);
    }
    
    // Удаляем старые файлы
    if (filesToDelete.length > 0) {
      await this.uploadService.deleteMultipleFiles(filesToDelete);
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
    
    return this.transformLifeInDOU(lifeInDOU);
  }

  async addMediaToLifeInDOU(
    teacherId: string,
    mediaItem: { type: 'photo' | 'video'; url: string; caption?: string },
  ): Promise<LifeInDOU> {
    let lifeInDOU = await this.lifeInDOURepository.findOne({
      where: { teacherId },
    });
    
    // Нормализуем URL перед сохранением
    const normalizedMediaItem = {
      ...mediaItem,
      url: this.normalizePath(mediaItem.url) || mediaItem.url,
    };
    
    // Если объекта нет, создаем новый
    if (!lifeInDOU) {
      lifeInDOU = this.lifeInDOURepository.create({
        teacherId,
        mediaItems: [normalizedMediaItem],
      });
    } else {
      // Добавляем новый медиа элемент к существующим
      const existingItems = lifeInDOU.mediaItems || [];
      lifeInDOU.mediaItems = [...existingItems, normalizedMediaItem];
    }
    
    const saved = await this.lifeInDOURepository.save(lifeInDOU);
    return this.transformLifeInDOU(saved);
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
    const profiles = await this.teacherProfileRepository.find({
      relations: ['user', 'socialLinks'],
    });
    
    // Формируем полные URL для каждого профиля
    return profiles.map(profile => this.transformProfile(profile));
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
      if (post.files && post.files.length > 0) {
        filesToDelete.push(...post.files);
      }
      if (post.fileUrl) {
        filesToDelete.push(post.fileUrl);
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
      if (mc.files && mc.files.length > 0) {
        filesToDelete.push(...mc.files);
      }
      if (mc.fileUrl) {
        filesToDelete.push(mc.fileUrl);
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

    // Собираем файлы из LifeInDOU и папок
    const lifeInDOU = await this.lifeInDOURepository.find({ where: { teacherId: profileId } });
    lifeInDOU.forEach(life => {
      if (life.mediaItems && life.mediaItems.length > 0) {
        filesToDelete.push(...life.mediaItems.map(item => item.url));
      }
    });

    // Собираем файлы из папок (folders)
    const lifeInDOUIds = lifeInDOU.map(life => life.id);
    let folders: Folder[] = [];
    if (lifeInDOUIds.length > 0) {
      folders = await this.folderRepository
        .createQueryBuilder('folder')
        .where('folder.lifeInDOUId IN (:...ids)', { ids: lifeInDOUIds })
        .getMany();
      
      folders.forEach(folder => {
        if (folder.mediaItems && folder.mediaItems.length > 0) {
          filesToDelete.push(...folder.mediaItems.map(item => item.url));
        }
      });
    }

    // Удаляем фото и видео профиля
    if (profile.photoUrl) {
      filesToDelete.push(profile.photoUrl);
    }
    if (profile.videoUrl) {
      filesToDelete.push(profile.videoUrl);
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
      // Сначала удаляем папки, связанные с lifeInDOU
      if (folders.length > 0) {
        await this.folderRepository.remove(folders);
      }
      await this.lifeInDOURepository.remove(lifeInDOU);
    }

    // Delete reviews
    const reviews = await this.reviewRepository.find({ 
      where: { teacher: { id: profileId } },
      relations: ['teacher'],
    });
    if (reviews.length > 0) {
      await this.reviewRepository.remove(reviews);
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

    const saved = await this.folderRepository.save(folder);
    return this.transformFolder(saved);
  }

  async getFoldersByTeacherId(teacherId: string): Promise<Folder[]> {
    const lifeInDOU = await this.lifeInDOURepository.findOne({
      where: { teacherId },
    });

    if (!lifeInDOU) {
      return [];
    }

    const folders = await this.folderRepository.find({
      where: { lifeInDOUId: lifeInDOU.id },
      order: { createdAt: 'DESC' },
    });

    return folders.map(folder => this.transformFolder(folder));
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

    const saved = await this.folderRepository.save(folder);
    return this.transformFolder(saved);
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

    const saved = await this.folderRepository.save(folder);
    return this.transformFolder(saved);
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
    const saved = await this.folderRepository.save(folder);
    return this.transformFolder(saved);
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



