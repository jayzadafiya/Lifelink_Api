import mongoose from 'mongoose';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './schema/review.schema';
import { DoctorService } from 'src/doctor/doctor.service';
import { createOne, getAll } from 'shared/handlerFactory';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private ReviewModel: mongoose.Model<Review>,
    private doctorService: DoctorService,
  ) {}

  // Method for get all reviews
  async getAllReviews(): Promise<Review[]> {
    return await getAll(this.ReviewModel);
  }

  // Method for create review
  async creatReview(
    reviewData: CreateReviewDto,
    doctorId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<Review> {
    // Check if the doctor exists and is approved
    const doctor = await this.doctorService.getDoctorById(doctorId);
    if (!doctor || doctor.isApproved !== 'approved') {
      throw new NotFoundException('Doctor not found!!');
    }

    // Check if the user has already reviewed this doctor
    const existingReview = await this.ReviewModel.find({
      doctor: doctorId,
      user: userId,
    });
    if (existingReview.length > 0) {
      throw new ConflictException('Review already done by this User');
    }

    const review = await createOne(this.ReviewModel, {
      ...reviewData,
      user: userId,
      doctor: doctorId,
    });

    if (!review) {
      throw new BadRequestException('Error while creating review');
    }

    // Update doctor's reviews
    this.doctorService.updateReviews(review.doctor, review._id);
    return review;
  }

  // Method for calcuate Avarage of doctor when user add review to doctor
  async calculateAverageRating(
    doctorId: mongoose.Types.ObjectId,
  ): Promise<void> {
    // Aggregate reviews for the doctor and calculate statistics
    const stats = await this.ReviewModel.aggregate([
      {
        $match: { doctor: doctorId },
      },
      {
        $group: {
          _id: '$doctor',
          totalRating: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    // Extract totalRating and averageRating from the aggregation result
    const { totalRating, averageRating } =
      stats.length > 0 ? stats[0] : { totalRating: 0, averageRating: 0 };

    // Round the average rating to two decimal places
    const roundedAverageRating = averageRating.toFixed(2);

    // Update doctor's ratings
    await this.doctorService.updateDoctroRatings(
      doctorId,
      totalRating,
      roundedAverageRating,
    );
  }
}
