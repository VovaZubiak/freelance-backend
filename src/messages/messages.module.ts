import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Messages } from '../entities/Messages';
import { Contracts } from '../entities/Contracts';
import { Users } from '../entities/Users';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [MikroOrmModule.forFeature([Messages, Contracts, Users])],
  controllers: [MessagesController],
  providers: [MessagesService, ChatGateway],
})
export class MessagesModule {}