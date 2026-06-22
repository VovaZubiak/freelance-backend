import { IsString, IsOptional, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: 'URL аватара', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ description: 'Біографія', example: 'Експерт у галузі веб-розробки' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'URL веб-сайту', example: 'https://example.com' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({ description: 'Посада', example: 'Веб-розробник' })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiProperty({ description: 'Погодинна ставка у доларах', example: '50' })
  @IsOptional()
  @IsNumberString({}, { message: 'Погодинна ставка має бути числовим рядком' })
  hourlyRate?: string;

  @ApiProperty({ description: 'Доступність', example: 'Працюю на повну ставку' })
  @IsOptional()
  @IsString()
  availability?: string;
  @ApiProperty({ description: 'Назва компанії', example: 'Tech Solutions' })
  @IsOptional()
  @IsString()
  companyName?: string;
}