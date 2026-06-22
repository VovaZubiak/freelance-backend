import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'ID контракту', example: 1 })
  @IsNotEmpty({ message: 'Вкажіть ID контракту' })
  @IsNumber()
  contractId!: number;

  @ApiProperty({ description: 'Вміст повідомлення', example: 'Привіт, я хочу обговорити деталі проекту.' })
  @IsNotEmpty({ message: 'Повідомлення не може бути порожнім' })
  @IsString()
  content!: string;
  @ApiProperty({ description: 'ID файлу, якщо є', example: 123, required: false })
  @IsOptional()
  @IsNumber()
  fileId?: number;
}