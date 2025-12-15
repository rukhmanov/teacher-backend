import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateLifeInDOUDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsArray()
  videos?: string[];
}
