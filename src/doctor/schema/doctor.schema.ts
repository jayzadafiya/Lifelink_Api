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

  @Prop({ default: 0 })
  totalPatients: number;

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

  // Method to calculate total patients
  static async calculateTotalPatients(
    doctorId: mongoose.Types.ObjectId,
  ): Promise<number> {
    const bookings = await mongoose
      .model('Booking')
      .aggregate([
        { $match: { doctor: doctorId } },
        { $group: { _id: '$user' } },
        { $count: 'totalPatients' },
      ]);

    return bookings.length > 0 ? bookings[0].totalPatients : 0;
  }
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

// DoctorSchema.post('save', async function (doc) {
//   const doctorId = doc._id;

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

//       const { totalRating, averageRating } =
//         stats.length > 0 ? stats[0] : { totalRating: 0, averageRating: 0 };

//       this.totalRating = totalRating;
//       this.averageRating = averageRating;
//     })
//     .catch((error) => {
//       console.error('Error retrieving aggregation result:', error);
//     });
// });
