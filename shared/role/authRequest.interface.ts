import mongoose from 'mongoose';
import { Role } from 'utils/role.enum';

export interface AuthRequest extends Request {
  user: {
    userId: mongoose.Types.ObjectId;
    role: Role;
  };
}
