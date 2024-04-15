import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Booking extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Docter', required: true })
  doctor: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  fees: number;

  @Prop({ required: true })
  session: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  bookingDate:string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
