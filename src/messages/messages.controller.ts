import { Controller, Post, Get, Body, Param, UseGuards, Request, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import 'multer';

@ApiTags('Повідомлення (Чат)')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post() 
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Відправити повідомлення' })
  async sendMessage(@Request() req: any, @Body() dto: CreateMessageDto) {
    return this.messagesService.sendMessage(req.user.userId, dto);
  }

  @Get('contract/:contractId') 
  @ApiOperation({ summary: 'Отримання історії повідомлень по контракту' })
  async getMessages(@Request() req: any, @Param('contractId') contractId: string) {
    return this.messagesService.getContractMessages(Number(contractId), req.user.userId);
  }

  @Get('proposal/:proposalId') 
  @ApiOperation({ summary: 'Отримати повідомлення пропозиції' })
  async getProposalMessages(@Request() req: any, @Param('proposalId') proposalId: string) {
    return this.messagesService.getProposalMessages(Number(proposalId), req.user.userId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Отримання списку останніх діалогів' })
  async getRecentChats(@Request() req: any) {
    return this.messagesService.getMyRecentChats(req.user.userId);
  }

  @Post('direct')
  @ApiOperation({ summary: 'Відправити прямое повідомлення' })
  async sendDirectMessage(@Req() req, @Body() dto: { receiverId: number; content: string }) {
    const senderId = req.user.userId; 
    return this.messagesService.sendDirectMessage(senderId, dto);
  }

  @Get('direct/:interlocutorId')
  @ApiOperation({ summary: 'Отримати історію прямих повідомлень' })
  async getDirectMessagesHistory(@Request() req: any, @Param('interlocutorId') interlocutorId: string) {
    return this.messagesService.getDirectMessagesHistory(req.user.userId, Number(interlocutorId));
  }

  @Post('upload/:contractId')
  @ApiOperation({ summary: 'Завантажити файл у робочу область' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  async uploadFile(
    @Request() req: any, 
    @Param('contractId') contractId: string, 
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.messagesService.saveProjectFile(req.user.userId, Number(contractId), file);
  }
}
