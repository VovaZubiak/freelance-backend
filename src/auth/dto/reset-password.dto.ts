import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль має бути не менше 6 символів' })
  newPassword!: string;
}