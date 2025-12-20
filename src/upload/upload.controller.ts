import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Res,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { memoryStorage } from 'multer';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(`Only image files are allowed. Received: ${file.mimetype}`),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please ensure the file field is named "file"');
    }
    
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }
    
    try {
      const url = await this.uploadService.uploadImage(file);
      return { url };
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const url = await this.uploadService.uploadFile(file);
    return { url };
  }

  /**
   * Проксирует файл из S3 для обхода проблем с CORS
   * Публичный endpoint - не требует авторизации для просмотра файлов
   */
  @Get('proxy')
  @SetMetadata('isPublic', true)
  async proxyFile(
    @Query('path') filePath: string,
    @Query('download') download?: string,
    @Res() res: Response,
  ) {
    if (!filePath) {
      throw new BadRequestException('File path is required');
    }

    try {
      console.log(`Proxy request for file: ${filePath}`);
      const { buffer, contentType } = await this.uploadService.getFile(filePath);
      
      // Извлекаем имя файла из пути для заголовка Content-Disposition
      const fileName = filePath.split('/').pop() || 'file';
      
      // Убеждаемся, что для PDF используется правильный Content-Type
      const finalContentType = contentType || (filePath.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
      
      res.setHeader('Content-Type', finalContentType);
      res.setHeader('Content-Length', buffer.length);
      
      // Если параметр download=true, используем attachment, иначе не устанавливаем Content-Disposition для просмотра
      if (download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      }
      // Для просмотра не устанавливаем Content-Disposition, чтобы браузер мог показать PDF в iframe/embed
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Кешируем на 1 час
      res.setHeader('Access-Control-Allow-Origin', '*'); // Разрешаем CORS
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Разрешаем методы
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type'); // Разрешаем доступ к заголовкам
      res.send(buffer);
    } catch (error) {
      console.error(`Error proxying file: ${error.message}`, error);
      throw new NotFoundException(`File not found: ${error.message}`);
    }
  }
}



