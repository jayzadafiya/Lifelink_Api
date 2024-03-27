import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
// import { Review } from 'src/review/schema/review.schema';
import { bcryptPassword } from 'utils/helperFunction';
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

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] })
  reviews?: mongoose.Schema.Types.ObjectId[];

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
