import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { bcryptPassword } from 'utils/helperFunction';
// import { Review } from './Review';
// import { Appointment } from './Appointment';

@Schema()
export class Doctor extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  passwordConfirm: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone?: number;

  @Prop()
  photo?: string;

  @Prop()
  ticketPrice?: number;

  @Prop()
  role?: string;

  @Prop()
  specialization?: string;

  @Prop([String])
  qualifications?: string[];

  @Prop([String])
  experiences?: string[];

  @Prop({ maxlength: 50 })
  bio?: string;

  @Prop()
  about?: string;

  @Prop([String])
  timeSlots?: string[];

  //   @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] })
  //   reviews?: Review[];

  @Prop({ default: 0 })
  averageRating?: number;

  @Prop({ default: 0 })
  totalRating?: number;

  @Prop({ enum: ['pending', 'approved', 'cancelled'], default: 'pending' })
  isApproved?: string;

  //   @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }] })
  //   appointments?: Appointment[];
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

DoctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptPassword(this.password);

  this.passwordConfirm = undefined;
  next();
});
