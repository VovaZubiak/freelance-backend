import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { AcceptProposalDto } from './dto/accept-proposal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('accept')
  async acceptProposal(@Request() req: any, @Body() dto: AcceptProposalDto) {
    return this.contractsService.acceptProposal(req.user.userId, req.user.role, dto);
  }
}