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
import mongoose from 'mongoose';
import { ReviewService } from './review.service';
import { Review } from './schema/review.schema';
import { RolesGuard } from 'shared/role/role.gurd';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthRequest } from 'shared/request.interface';

@Controller('doctors/:doctorId/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  // Endpoint for get all reviews
  @Get('/')
  async getAllReviews(): Promise<Review[]> {
    return await this.reviewService.getAllReviews();
  }

  // Endpoint for create review
  @UseGuards(RolesGuard)
  @Roles(Role.Patient)
  @Post('/')
  async createReview(
    @Param('doctorId') doctorId: mongoose.Types.ObjectId,
    @Body() reviewDto: CreateReviewDto,
    @Req() req: AuthRequest,
  ): Promise<Review> {
    // Validate params ID
    if (!mongoose.Types.ObjectId.isValid(doctorId))
      throw new BadRequestException('Invalid Doctro Id!!');

    const review = await this.reviewService.creatReview(
      reviewDto,
      doctorId,
      req.user.userId,
    );

    // Review validation done in service

    // Calculate average rating for the doctor
    await this.reviewService.calculateAverageRating(review.doctor);

    return review;
  }
}
