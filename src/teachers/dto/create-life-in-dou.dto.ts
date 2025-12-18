import { IsOptional, IsArray } from 'class-validator';

export class CreateLifeInDOUDto {
  @IsOptional()
  @IsArray()
  mediaItems?: Array<{ type: 'photo' | 'video'; url: string; caption?: string }>;
}



