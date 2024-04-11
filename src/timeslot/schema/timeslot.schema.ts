import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Timeslots extends Document {
  @Prop({ required: true })
  time: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Doctor', required: true })
  doctor: mongoose.Types.ObjectId;

  @Prop({ type: [String] })
  bookingDate: string[];

  @Prop({ enum: ['morning', 'afternoon', 'evening'] })
  slotPhase: string;
}

export const TimeslotsSchema = SchemaFactory.createForClass(Timeslots);
