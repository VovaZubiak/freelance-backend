import { IsString, IsNumber, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: 'Назва проекту', example: 'Розробка веб-сайту' })
  @IsString()
  @IsNotEmpty({ message: 'Назва проекту не може бути порожньою' })
  title!: string;

  @ApiProperty({ description: 'Опис проекту', example: 'Потрібно створити веб-сайт для компанії' })
  @IsString()
  @IsNotEmpty({ message: 'Опис проекту не може бути порожнім' })
  description!: string;

  @ApiProperty({ description: 'Бюджет', example: 10000 })
  @IsNumber({}, { message: 'Бюджет має бути числом' })
  budget?: number;

  @ApiProperty({ description: 'ID навичок', example: [1, 2, 3] })
  @IsArray({ message: 'Навички мають бути масивом' })
  skillIds?: number[];
}