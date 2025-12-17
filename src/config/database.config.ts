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

  // Support both POSTGRESQL_* and DB_* environment variables
  // POSTGRESQL_* takes precedence if both are set
  const host = configService.get<string>('POSTGRESQL_HOST') 
    || configService.get<string>('DB_HOST', 'localhost');
  
  const port = configService.get<number>('POSTGRESQL_PORT')
    || configService.get<number>('DB_PORT', isPostgres ? 5432 : 3306);
  
  const username = configService.get<string>('POSTGRESQL_USER')
    || configService.get<string>('DB_USERNAME', defaultUsername);
  
  const password = configService.get<string>('POSTGRESQL_PASSWORD')
    || configService.get<string>('DB_PASSWORD', '');
  
  const database = configService.get<string>('POSTGRESQL_DBNAME')
    || configService.get<string>('DB_DATABASE', 'school');

  return {
    type: isPostgres ? 'postgres' : 'mysql',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    logging: configService.get<string>('NODE_ENV') === 'development',
  };
};


