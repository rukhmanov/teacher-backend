import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

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

    // Возвращаем публичный URL файла
    return `${this.s3Url}/${this.bucketName}/${filename}`;
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

    // Возвращаем публичный URL файла
    return `${this.s3Url}/${this.bucketName}/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Извлекаем ключ файла из URL
      // URL формат: https://s3.twcstorage.ru/bucket-name/path/to/file
      if (!fileUrl || !fileUrl.includes(this.s3Url)) {
        console.warn('Invalid file URL for deletion:', fileUrl);
        return;
      }

      // Убираем базовый URL и извлекаем путь после bucket name
      const urlWithoutBase = fileUrl.replace(this.s3Url + '/', '');
      const urlParts = urlWithoutBase.split('/');
      
      // Первая часть - это bucket name, остальное - ключ файла
      if (urlParts[0] === this.bucketName) {
        const key = urlParts.slice(1).join('/');
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          }),
        );
      } else {
        // Если bucket name не совпадает, пытаемся использовать весь путь после базового URL
        const key = urlParts.join('/');
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          }),
        );
      }
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


