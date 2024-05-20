import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { bcryptPassword } from 'utils/helperFunction';
import { Role } from 'utils/role.enum';

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
  phone?: string;

  @Prop()
  photo?: string;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender?: string;

  @Prop()
  ticketPrice?: number;

  @Prop({ enum: Role })
  role?: string;

  @Prop()
  specialization?: string;

  @Prop({ maxlength: 50 })
  bio?: string;

  @Prop()
  about?: string;

  @Prop()
  address?: string;

  @Prop()
  fees: number;

  @Prop([
    {
      startingDate: String,
      endingDate: String,
      degree: String,
      university: String,
    },
  ])
  qualifications?: {
    startingDate: string;
    endingDate: string;
    degree: string;
    university: string;
  }[];

  @Prop([
    {
      startingDate: String,
      endingDate: String,
      position: String,
      place: String,
    },
  ])
  experiences?: {
    startingDate: string;
    endingDate: string;
    position: string;
    place: string;
  }[];

  @Prop([
    {
      slot: String,
      appointments_time: Number,
      startingTime: String,
      endingTime: String,
    },
  ])
  timeSlots_data?: {
    slot: string;
    appointments_time: number;
    startingTime: string;
    endingTime: string;
  }[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] })
  reviews?: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: 0 })
  averageRating?: number;

  @Prop({ default: 0 })
  totalRating?: number;

  @Prop({ enum: ['pending', 'approved', 'cancelled'], default: 'pending' })
  isApproved?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  message?: string;

  @Prop()
  passwordChangedAt: Date;

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetExpires: Date;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

DoctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptPassword(this.password);

  this.passwordConfirm = undefined;
  next();
});

DoctorSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

DoctorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
