import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class MoveMediaDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(['photo', 'video'])
  @IsNotEmpty()
  type: 'photo' | 'video';

  @IsString()
  @IsOptional()
  caption?: string;

  @IsString()
  @IsOptional()
  targetFolderId?: string; // null или undefined означает перемещение в основной раздел
}

