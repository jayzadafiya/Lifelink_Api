import mongoose from 'mongoose';
import {
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

  async getAllReview(): Promise<Review[]> {
    return getAll(this.ReviewModel);
  }

  async creatReview(
    reviewData: CreateReviewDto,
    doctorId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<Review> {
    const doctor = await this.doctorService.getDoctorById(doctorId);

    if (!doctor || doctor.isApproved !== 'approved') {
      throw new NotFoundException('Doctor not found!!');
    }

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

    this.doctorService.updateReviews(review.doctor, review._id);
    return review;
  }

  async calculateAverageRating(
    doctorId: mongoose.Types.ObjectId,
  ): Promise<void> {
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

    const { totalRating, averageRating } =
      stats.length > 0 ? stats[0] : { totalRating: 0, averageRating: 0 };
    // Round the average rating to two decimal places
    const roundedAverageRating = averageRating.toFixed(2);

    await this.doctorService.updateDoctroRatings(
      doctorId,
      totalRating,
      roundedAverageRating,
    );
  }
}
