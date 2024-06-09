import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { bcryptPassword } from 'utils/helperFunction';
import { Role } from 'utils/role.enum';

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ select: false })
  passwordConfirm: string;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: Role, default: Role.Admin })
  role?: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'UpdateDoctor',
  })
  doctors: mongoose.Types.ObjectId[];

  @Prop()
  currentToken: string;

  @Prop({ select: false })
  secretKey: string;

  @Prop()
  browser?: string;

  @Prop()
  device?: string;

  @Prop()
  os?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
// Pre middlaware for password encoding
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptPassword(this.password);

  this.passwordConfirm = undefined;
  next();
});
