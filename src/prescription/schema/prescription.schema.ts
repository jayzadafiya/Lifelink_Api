// form-data.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Medicine {
  @Prop()
  name: string;

  @Prop()
  dailyTime: string;

  @Prop()
  mealTime: string;

  @Prop()
  totalMedicine: number;
}

@Schema()
export class Prescription extends Document {
  @Prop()
  symptoms: string[];

  @Prop()
  advice: string[];

  @Prop()
  test: string[];

  @Prop({ type: [Medicine], required: true })
  medicine: Medicine[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  })
  booking: mongoose.Types.ObjectId;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
