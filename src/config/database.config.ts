import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbType = configService.get<string>('DB_TYPE', 'postgres');
  const isPostgres = dbType === 'postgres';

  // Default username for PostgreSQL on macOS/Homebrew is often the system username
  // For MySQL it's 'root'
  const defaultUsername = isPostgres 
    ? (process.env.USER || 'postgres') 
    : 'root';

  return {
    type: isPostgres ? 'postgres' : 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', isPostgres ? 5432 : 3306),
    username: configService.get<string>('DB_USERNAME', defaultUsername),
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_DATABASE', 'school'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    logging: configService.get<string>('NODE_ENV') === 'development',
  };
};


