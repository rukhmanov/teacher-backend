import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { SocialPlatform } from '../../common/constants/social-platforms';

export class AddSocialLinkDto {
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  customName?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
