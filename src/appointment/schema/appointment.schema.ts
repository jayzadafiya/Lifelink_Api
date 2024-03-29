import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Appointment extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true })
  doctor: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  ticketPrice: string;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ enum: ['pending', 'approved', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ default: true })
  isPaid: boolean;
}

export const AppointmentgSchema = SchemaFactory.createForClass(Appointment);
