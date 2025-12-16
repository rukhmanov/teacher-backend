import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateParentSectionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  files?: string[];
}

