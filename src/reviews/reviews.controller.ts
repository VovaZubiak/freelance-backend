import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Відгуки та Рейтинги')
@ApiBearerAuth()
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('create')
  async leaveReview(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.leaveReview(req.user.userId, req.user.role, dto);
  }
}