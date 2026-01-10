import { IsString, IsOptional, IsNumber, ValidateIf } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  patronymic?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  })
  @ValidateIf((o) => o.latitude !== undefined && o.latitude !== null)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  })
  @ValidateIf((o) => o.longitude !== undefined && o.longitude !== null)
  @IsNumber()
  longitude?: number;
}




