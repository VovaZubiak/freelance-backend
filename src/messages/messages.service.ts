import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateMessageDto } from './dto/create-message.dto';
import { Messages } from '../entities/Messages';
import { Contracts } from '../entities/Contracts';
import { Proposals } from '../entities/Proposals';
import { Users } from '../entities/Users';
import { ChatGateway } from './chat.gateway';
import { Projectfiles } from '../entities/Projectfiles';

@Injectable()
export class MessagesService {
  constructor(private readonly em: EntityManager, private readonly chatGateway: ChatGateway) {}

  async saveProjectFile(userId: number, contractId: number, file: Express.Multer.File) {
    const contract = await this.em.findOne(Contracts, { contractId });
    const uploader = await this.em.findOne(Users, { userId });

    if (!contract || !uploader) throw new NotFoundException('Контракт або користувача не знайдено');

    const projectFile = this.em.create(Projectfiles, {
      contract,
      uploader,
      fileNameOriginal: file.originalname,
      filePathStorage: `${process.env.NEXT_PUBLIC_API_URL}/uploads/${file.filename}`,
      fileSizeBytes: BigInt(file.size),
    });

    await this.em.persistAndFlush(projectFile);

    return {
      fileId: projectFile.fileId,
      fileNameOriginal: projectFile.fileNameOriginal,
      filePathStorage: projectFile.filePathStorage,
      fileSizeBytes: projectFile.fileSizeBytes?.toString(),
    };
  }

  async sendMessage(userId: number, dto: any) {
    const sender = await this.em.findOne(Users, { userId });
    if (!sender) throw new NotFoundException('Відправника не знайдено');

    let targetEntity: any = {}; 
    let receiverUser: Users;

    if (dto.proposalId) {
      const proposal = await this.em.findOne(Proposals, { proposalId: dto.proposalId }, { populate: ['project.client', 'freelancer'] });
      if (!proposal) throw new NotFoundException('Заявку не знайдено');
      const isClient = proposal.project.client.userId === userId;
      const isFreelancer = proposal.freelancer.userId === userId;
      if (!isClient && !isFreelancer) throw new ForbiddenException('Ви не маєте доступу до цього чату');

      targetEntity = { proposal };
      receiverUser = isClient ? proposal.freelancer : proposal.project.client;
    } else if (dto.contractId) {
      const contract = await this.em.findOne(Contracts, { contractId: dto.contractId }, { populate: ['client', 'freelancer'] });
      if (!contract) throw new NotFoundException('Контракт не знайдено');
      const isClient = contract.client.userId === userId;
      const isFreelancer = contract.freelancer.userId === userId;
      if (!isClient && !isFreelancer) throw new ForbiddenException('Ви не маєте доступу до цього чату');

      targetEntity = { contract };
      receiverUser = isClient ? contract.freelancer : contract.client;
    } else {
      throw new BadRequestException('Вкажіть proposalId або contractId');
    }

    let attachedFile: Projectfiles | null = null;
    if (dto.fileId) {
      attachedFile = await this.em.findOne(Projectfiles, { fileId: dto.fileId });
    }

    const message = this.em.create(Messages, {
      ...targetEntity,
      sender,
      receiver: receiverUser,
      messageBody: dto.content || '',
      attachedFile: attachedFile,
    });

    await this.em.persistAndFlush(message);

    this.chatGateway.notifyUser(receiverUser.userId, {
      messageId: message.messageId,
      proposalId: dto.proposalId, 
      contractId: dto.contractId,
      messageBody: message.messageBody,
      attachedFile: attachedFile ? {
        fileName: attachedFile.fileNameOriginal,
        fileUrl: attachedFile.filePathStorage
      } : null,
      senderName: sender.fullName,
      sentAt: message.sentAt
    });

    return message;
  }

  async getProposalMessages(proposalId: number, userId: number) {
    const proposal = await this.em.findOne(Proposals, { proposalId }, { populate: ['project.client', 'freelancer'] });
    if (!proposal) throw new NotFoundException('Заявку не знайдено');

    if (proposal.project.client.userId !== userId && proposal.freelancer.userId !== userId) {
      throw new ForbiddenException('Ви не маєте доступу до цього чату');
    }

    return this.em.find(
      Messages,
      { proposal: { proposalId } },
      { orderBy: { sentAt: 'ASC' }, populate: ['sender', 'attachedFile'] }
    );
  }

  async getContractMessages(contractId: number, userId: number) {
    const contract = await this.em.findOne(Contracts, { contractId }, { populate: ['client', 'freelancer'] });
    if (!contract) throw new NotFoundException('Контракт не знайдено');

    if (contract.client.userId !== userId && contract.freelancer.userId !== userId) {
      throw new ForbiddenException('Ви не маєте доступу до цього чату');
    }

    return this.em.find(
      Messages,
      { contract: { contractId } },
      { orderBy: { sentAt: 'ASC' }, populate: ['sender', 'attachedFile'] }
    );
  }

  async getMyRecentChats(userId: number) {
    const messages = await this.em.find(
      Messages,
      {
        $or: [
          { sender: { userId } },
          { receiver: { userId } }
        ]
      },
      {
        orderBy: { sentAt: 'DESC' }, 
        limit: 100,
        populate: ['sender', 'receiver', 'proposal', 'contract']
      }
    );

    const uniqueChats = new Map();

    for (const msg of messages) {
      const isMe = msg.sender.userId === userId;
      const interlocutor = isMe ? msg.receiver : msg.sender;

      const isContract = !!msg.contract;
      const isProposal = !!msg.proposal;
      const isDirect = !isContract && !isProposal;

      let chatType = 'direct';
      let referenceId = interlocutor.userId;

      if (isContract) {
        chatType = 'contract';
        referenceId = msg.contract?.contractId as number;
      } else if (isProposal) {
        chatType = 'proposal';
        referenceId = msg.proposal?.proposalId as number;
      }

      const chatKey = `${chatType}_${referenceId}`;

      if (!uniqueChats.has(chatKey)) {
        uniqueChats.set(chatKey, {
          chatId: chatKey,
          chatType: chatType,
          referenceId: referenceId,
          interlocutorName: interlocutor.fullName,
          lastMessage: msg.messageBody || '📎 Файл',
          sentAt: msg.sentAt,
          isMe: isMe
        });
      }
    }

    return Array.from(uniqueChats.values()).slice(0, 15);
  }

  async sendDirectMessage(senderId: number, dto: { receiverId: number; content: string }) {
    if (senderId === dto.receiverId) throw new BadRequestException('Ви не можете написати самому собі');

    const sender = await this.em.findOne(Users, { userId: senderId });
    const receiver = await this.em.findOne(Users, { userId: dto.receiverId });

    if (!sender || !receiver) throw new NotFoundException('Користувача не знайдено');

    const message = this.em.create(Messages, {
      sender,
      receiver,
      messageBody: dto.content,
      isRead: false,
    });

    await this.em.persistAndFlush(message);

    if (this.chatGateway) {
      this.chatGateway.notifyUser(receiver.userId, {
        messageId: message.messageId,
        senderId: sender.userId,
        senderName: sender.fullName,
        messageBody: message.messageBody,
        sentAt: message.sentAt,
        isDirect: true
      });
    }

    return message;
  }

  async getDirectMessagesHistory(userId: number, interlocutorId: number) {
    return this.em.find(
      Messages,
      {
        proposal: null,
        contract: null,
        $or: [
          { sender: { userId }, receiver: { userId: interlocutorId } },
          { sender: { userId: interlocutorId }, receiver: { userId } }
        ]
      },
      { orderBy: { sentAt: 'ASC' }, populate: ['sender', 'attachedFile'] }
    );
  }
}