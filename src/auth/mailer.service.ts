import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    console.log('EMAIL AUTH:', process.env.SMTP_USER, process.env.SMTP_PASS ? '***' : 'MISSING');
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"WorkConnect Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Відновлення пароля на WorkConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a; text-align: center;">Відновлення доступу</h2>
          <p style="color: #475569; font-size: 16px;">Вітаємо! Ми отримали запит на скидання пароля для вашого акаунту.</p>
          <p style="color: #475569; font-size: 16px;">Якщо це були ви, натисніть на кнопку нижче, щоб створити новий пароль:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Створити новий пароль</a>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">Посилання дійсне протягом 1 години. Якщо ви не робили цього запиту, просто проігноруйте цей лист.</p>
        </div>
      `,
    });
  }
}