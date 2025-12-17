import { IsString, IsOptional } from 'class-validator';

export class CreatePresentationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsString()
  cardColor?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;
}


