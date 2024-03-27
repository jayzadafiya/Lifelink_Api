import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { Review } from './schema/review.schema';
import { RolesGuard } from 'src/role/role.gurd';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'utils/role.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import mongoose from 'mongoose';

@Controller('doctors/:doctorId/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('/')
  async getAllReviews(): Promise<Review[]> {
    return this.reviewService.getAllReview();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Patient)
  @Post('/')
  async createReview(
    @Param('doctorId') doctorId: mongoose.Types.ObjectId,
    @Body() reviewDto: CreateReviewDto,
    @Req() req,
  ): Promise<Review> {
    if (!mongoose.Types.ObjectId.isValid(doctorId))
      throw new BadRequestException('Invalid Doctro Id!!');

    const review = await this.reviewService.creatReview(
      reviewDto,
      doctorId,
      req.user.userId,
    );

    await this.reviewService.calculateAverageRating(review.doctor);

    return review;
  }
}
