import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail({}, { message: 'Невірний формат email адреси' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Пароль має містити щонайменше 8 символів' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
    message: 'Пароль має містити хоча б одну велику літеру, одну маленьку літеру та одну цифру' 
  })
  password!: string;

  @IsNotEmpty({ message: 'Будь ласка, підтвердіть пароль' })
  confirmPassword!: string;

  @IsString()
  full_name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Роль є обов\'язковою (freelancer або client)' })
  role!: 'freelancer' | 'client';
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Невірний формат email адреси' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'Пароль є обов\'язковим' })
  password!: string;
}