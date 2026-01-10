import { IsString, IsNotEmpty, IsInt, Min, Max, IsEmail } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsEmail()
  @IsNotEmpty()
  authorEmail: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

