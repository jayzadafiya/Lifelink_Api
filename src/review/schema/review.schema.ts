import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Doctor' })
  doctor: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User' })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  reviewText: string;

  @Prop({ required: true, min: 0, max: 5, default: 0 })
  rating: number;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.pre('find', function (next) {
  this.populate('user', 'name photo');

  next();
});

// ReviewSchema.post('save', async function (doc) {
//   const doctorId = doc.doctor;

//   const cursor = await this.collection.aggregate([
//     {
//       $match: { doctor: doctorId },
//     },
//     {
//       $group: {
//         _id: '$doctor',
//         numOfRating: { $sum: 1 },
//         avgRating: { $avg: '$rating' },
//       },
//     },
//   ]);

//   cursor
//     .toArray()
//     .then(async (results) => {
//       const stats = results[0];

//       console.log(stats);

//       // await this.model('Doctor').findOneAndUpdate(
//       //   { _id: doctorId },
//       //   {
//       //     $inc: { numOfRating: 1 },
//       //     $avg: { rating: '$rating' }, // Update avgRating using aggregation pipeline
//       //   },
//       // );

//       // Instantiate your DoctorService
//       const doctorService = DoctorService;
//       doctorService.prototype.updateDoctroRatings(
//         doctorId,
//         stats.numOfRating,
//         stats.avgRating,
//       );
//     })
//     .catch((error) => {
//       console.error('Error retrieving aggregation result:', error);
//     });
// });
