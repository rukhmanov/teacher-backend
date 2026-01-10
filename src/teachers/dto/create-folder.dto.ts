import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  mediaItems?: Array<{ type: 'photo' | 'video'; url: string; caption?: string }>;
}

