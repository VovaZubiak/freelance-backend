
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ResetTokens } from '../entities/ResetTokens';
import { MailerService } from './mailer.service';
import * as bcrypt from 'bcrypt';
import { EntityManager } from '@mikro-orm/postgresql';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Roles } from '../entities/Roles';
import { Users } from '../entities/Users';
import { Freelancerprofiles } from '../entities/Freelancerprofiles';
import { Clientprofiles } from '../entities/Clientprofiles';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Userwallets } from '../entities/Userwallets';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
    private readonly mailerService: MailerService,
  ) {}

async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Паролі не співпадають!');
    }

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Користувач з таким email вже існує');
    }

    const role = await this.em.findOne(Roles, { roleName: dto.role });
    if (!role) {
      throw new BadRequestException(`Роль '${dto.role}' не знайдена в системі`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash: hashedPassword,
      fullName: dto.full_name,
    });

    user.roles.add(role);

    if (dto.role === 'freelancer') {
      const profile = this.em.create(Freelancerprofiles, { user: user });
      this.em.persist(profile);
    } else if (dto.role === 'client') {
      const profile = this.em.create(Clientprofiles, { user: user });
      this.em.persist(profile);
    }

    const wallet = this.em.create(Userwallets, {
      user: user,
      balance: '0.00'
    });
    this.em.persist(wallet);

    await this.em.persist(user).flush();

    return this.generateToken(user.userId, user.email, role.roleName);
  }

  async login(dto: LoginDto) {
    const user = await this.em.findOne(
      Users, 
      { email: dto.email }, 
      { populate: ['roles'] }
    );

    if (!user) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    const userRole = user.roles.getItems()[0]?.roleName || 'user';

    return this.generateToken(user.userId, user.email, userRole);
  }

  private generateToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }


  async forgotPassword(email: string) {
    const user = await this.em.findOne(Users, { email });
    if (!user) {
      throw new BadRequestException('Користувача з таким email не знайдено');
    }

    const token = uuidv4(); 
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 година

    const resetToken = this.em.create(ResetTokens, {
      token,
      expiresAt,
      user,
    });

    await this.em.persistAndFlush(resetToken);
    await this.mailerService.sendResetPasswordEmail(user.email, token);

    return { message: 'Лист для відновлення пароля надіслано на вашу пошту' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetRecord = await this.em.findOne(ResetTokens, {
      token: dto.token,
      expiresAt: { $gt: new Date() } 
    }, { populate: ['user'] }); 

    if (!resetRecord) {
      throw new BadRequestException('Токен недійсний або його термін дії вичерпано');
    }

    const user = resetRecord.user;
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);

    this.em.remove(resetRecord);
    await this.em.flush();

    return { message: 'Пароль успішно змінено' };
  }
}
