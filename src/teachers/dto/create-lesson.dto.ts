import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @IsOptional()
  @IsString()
  cardColor?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;
}


