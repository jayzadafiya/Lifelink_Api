import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Doctor } from 'src/doctor/schema/doctor.schema';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true })
  doctor: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  fees: number;

  @Prop({ required: true })
  sessionCustomerId: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  bookingDate: string;

  @Prop({ enum: ['pending', 'approved', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ default: true })
  isPaid: boolean;
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

BookingSchema.post('save', async function (doc, next) {
  const DoctorModel = new mongoose.Model(Doctor);
  const totalPatients = await DoctorModel.calculateTotalPatients(doc.doctor);
  await DoctorModel.findByIdAndUpdate(doc.doctor, { totalPatients });
  next();
});
