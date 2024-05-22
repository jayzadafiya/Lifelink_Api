import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Doctor } from 'src/doctor/schema/doctor.schema';
import { User } from 'src/user/schema/user.schema';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true })
  doctor: Doctor;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  fees: number;

  @Prop({ required: true })
  sessionCustomerId: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  bookingDate: string;

  @Prop({ enum: ['pending', 'complate', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ default: true })
  isPaid: boolean;

  @Prop({ required: true })
  paymentIntentId: string;

  @Prop()
  refundId: string;

  @Prop()
  refundStatus: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Use pre middelware for populate user and doctor
BookingSchema.pre('find', function (next) {
  this.populate('user').populate({
    path: 'doctor',
    select: 'name email photo',
  });

  next();
});
