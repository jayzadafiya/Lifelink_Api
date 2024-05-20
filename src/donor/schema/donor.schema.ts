import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Donor extends Document {
  @Prop({ required: true })
  dob: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    type: { type: string; default: 'Point'; enum: ['Point'] };
    coordinates: number[];
  };

  @Prop()
  surgery: string;

  @Prop()
  disease?: string;

  @Prop()
  styling?: string;

  @Prop({ required: true })
  bloodType: string;

  @Prop({ required: true })
  addharCard: string;

  @Prop({ required: true })
  lastDonationDate: string;
}

export const DonorSchema = SchemaFactory.createForClass(Donor);

DonorSchema.index({ location: '2dsphere' });
