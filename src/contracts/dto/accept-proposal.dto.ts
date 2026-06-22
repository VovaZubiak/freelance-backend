import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptProposalDto {
  @ApiProperty({ description: 'ID заявки', example: 1 })
  @IsNotEmpty({ message: 'ID ставки є обов\'язковим' })
  @IsNumber()
  proposalId!: number;
}