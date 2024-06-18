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
