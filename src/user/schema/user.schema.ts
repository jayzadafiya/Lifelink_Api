import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { Appointment } from './Appointment';
import { bcryptPassword } from '../../../utils/helperFunction';
import { Role } from 'utils/role.enum';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone?: string;

  @Prop()
  photo?: string;

  @Prop({ enum: Role })
  role?: string;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender?: string;

  @Prop()
  bloodType?: string;

  @Prop()
  passwordConfirm?: string;

  @Prop({default:true})
  isActive:boolean
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre middlaware for password encoding
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptPassword(this.password);

  this.passwordConfirm = undefined;
  next();
});
