import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({ description: 'ID проекту', example: 1 })
  @IsNotEmpty({ message: 'ID проекту є обов\'язковим' })
  @IsNumber()
  projectId!: number;

  @ApiProperty({ description: 'Супровідний лист', example: 'Доброго дня, я хотів би подати заявку на цей проект.' })
  @IsNotEmpty({ message: 'Супровідний лист не може бути порожнім' })
  @IsString()
  coverLetter!: string;

  @ApiProperty({ description: 'Ваша ставка', example: 100 })
  @IsNotEmpty({ message: 'Вкажіть вашу ставку' })
  @IsNumber({}, { message: 'Ставка має бути числом' })
  @Min(1)
  bidAmount!: number;

  @ApiProperty({ description: 'Орієнтовний час виконання', example: 5 })
  @IsNotEmpty({ message: 'Вкажіть час виконання' })
  @IsNumber()
  @Min(1)
  estimatedTimeDays!: number;
}