import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID контракта', example: 1 })
  @IsNotEmpty({ message: 'Вкажіть ID контракта' })
  @IsNumber()
  contractId!: number;

  @ApiProperty({ description: 'Оцінка', example: 5 })
  @IsNotEmpty({ message: 'Вкажіть оцінку' })
  @IsNumber()
  @Min(1, { message: 'Мінамальна оцінка - 1 зірка' })
  @Max(5, { message: 'Максимальна оцінка - 5 зірок' })
  stars!: number;

  @ApiProperty({ description: 'Текстовий відгук', example: 'Дуже задоволений роботою!' })
  @IsNotEmpty({ message: 'Напишіть текстовий відгук' })
  @IsString()
  comment!: string;
}