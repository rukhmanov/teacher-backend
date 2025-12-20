import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { FilePathUtil } from '../common/utils/file-path.util';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly s3Url: string;

  constructor(private configService: ConfigService) {
    // Получаем обязательные параметры с проверкой
    const s3Url = this.configService.getOrThrow<string>('S3_URL');
    const accessKey = this.configService.getOrThrow<string>('S3_ACCESS_KEY');
    const secretKey = this.configService.getOrThrow<string>('S3_SECRET_KEY');
    const region = this.configService.get<string>('S3_REGION', 'ru-1');

    // Настройка S3 клиента
    this.s3Client = new S3Client({
      endpoint: s3Url,
      region: region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // Для S3-совместимых хранилищ
    });

    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
    this.s3Url = s3Url;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const filename = `images/${uuidv4()}.${fileExtension}`;

    const commandParams: any = {
      Bucket: this.bucketName,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // ACL может не поддерживаться некоторыми S3-совместимыми хранилищами
    const useAcl = this.configService.get<string>('S3_USE_ACL', 'false') === 'true';
    if (useAcl) {
      commandParams.ACL = 'public-read';
    }

    await this.s3Client.send(new PutObjectCommand(commandParams));

    // Возвращаем относительный путь для хранения в БД: bucket-name/path/to/file
    return `${this.bucketName}/${filename}`;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const filename = `files/${uuidv4()}.${fileExtension}`;

    const commandParams: any = {
      Bucket: this.bucketName,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // ACL может не поддерживаться некоторыми S3-совместимыми хранилищами
    const useAcl = this.configService.get<string>('S3_USE_ACL', 'false') === 'true';
    if (useAcl) {
      commandParams.ACL = 'public-read';
    }

    await this.s3Client.send(new PutObjectCommand(commandParams));

    // Возвращаем относительный путь для хранения в БД: bucket-name/path/to/file
    return `${this.bucketName}/${filename}`;
  }

  /**
   * Получает файл из S3 хранилища
   */
  async getFile(filePath: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      // Извлекаем относительный путь, если передан полный URL
      let relativePath = FilePathUtil.extractRelativePath(filePath, this.s3Url) || filePath;
      
      // Заменяем старый bucket name на новый, если нужно
      const oldBucketName = '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc';
      if (relativePath.startsWith(oldBucketName + '/')) {
        relativePath = relativePath.replace(oldBucketName + '/', this.bucketName + '/');
      }
      
      // Убираем bucket name из пути для получения ключа файла в S3
      let key = relativePath;
      if (key.startsWith(this.bucketName + '/')) {
        key = key.substring(this.bucketName.length + 1);
      }

      console.log(`Getting file from S3: bucket=${this.bucketName}, key=${key}`);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('File body is empty');
      }

      // Читаем поток данных в буфер
      const chunks: Buffer[] = [];
      const stream = response.Body as any;
      
      // Преобразуем поток в буфер
      if (stream instanceof Buffer) {
        // Если это уже буфер
        const buffer = stream;
        const contentType = response.ContentType || 'application/octet-stream';
        console.log(`File loaded successfully: ${buffer.length} bytes, contentType=${contentType}`);
        return { buffer, contentType };
      } else {
        // Если это поток, читаем его
        for await (const chunk of stream) {
          chunks.push(Buffer.from(chunk));
        }
      }
      
      const buffer = Buffer.concat(chunks);
      const contentType = response.ContentType || 'application/octet-stream';

      console.log(`File loaded successfully: ${buffer.length} bytes, contentType=${contentType}`);

      return { buffer, contentType };
    } catch (error) {
      console.error(`Error getting file from S3: ${error.message}`, error);
      throw new Error(`Failed to get file from S3: ${error.message}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (!filePath) {
        console.warn('Invalid file path for deletion:', filePath);
        return;
      }

      // filePath может быть:
      // 1. Относительный путь: bucket-name/path/to/file
      // 2. Полный URL: https://s3.twcstorage.ru/bucket-name/path/to/file
      
      let key: string;
      
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        // Полный URL - извлекаем относительный путь
        const urlWithoutBase = filePath.replace(this.s3Url + '/', '').replace(this.s3Url, '');
        const urlParts = urlWithoutBase.split('/');
        
        // Первая часть - это bucket name, остальное - ключ файла
        if (urlParts[0] === this.bucketName) {
          key = urlParts.slice(1).join('/');
        } else {
          // Если bucket name не совпадает, используем весь путь после базового URL
          key = urlParts.slice(1).join('/');
        }
      } else {
        // Относительный путь: bucket-name/path/to/file
        const pathParts = filePath.split('/');
        if (pathParts[0] === this.bucketName) {
          key = pathParts.slice(1).join('/');
        } else {
          // Если путь не содержит bucket name, используем как есть
          key = filePath;
        }
      }

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      // Не бросаем ошибку, чтобы не ломать процесс, если файл уже удален
    }
  }

  async deleteMultipleFiles(fileUrls: string[]): Promise<void> {
    // Удаляем файлы параллельно, но не ждем ошибок
    const deletePromises = fileUrls.map((url) => this.deleteFile(url));
    await Promise.allSettled(deletePromises);
  }
}



