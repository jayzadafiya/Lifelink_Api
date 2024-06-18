import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'utils/role.enum';
import {
  Experience,
  Qualification,
  Timeslot,
} from '../../doctor/schema/QTE.schema';

@Schema()
export class UpdateTimeslot {
  @Prop({ required: true })
  slotName: string;

  @Prop({ required: true })
  times: string[];
}

@Schema()
export class UpdateDoctor extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone: string;

  @Prop()
  photo: string;

  @Prop()
  document: string;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender: string;

  @Prop()
  ticketPrice: number;

  @Prop({ enum: Role })
  role: string;

  @Prop()
  specialization: string;

  @Prop({ maxlength: 50 })
  bio: string;

  @Prop()
  about: string;

  @Prop()
  address: string;

  @Prop()
  fees: number;

  @Prop({ type: [Qualification], required: false })
  qualifications: Qualification[];

  @Prop({ type: [Experience], required: false })
  experiences: Experience[];

  @Prop({ type: [Timeslot], required: false })
  timeSlots_data: Timeslot[];

  @Prop({ type: [UpdateTimeslot] })
  timeslots?: UpdateTimeslot[];
}

export const UpdateDoctorSchema = SchemaFactory.createForClass(UpdateDoctor);
