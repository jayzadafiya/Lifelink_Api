import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from 'shared/handlerFactory';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { CreateUserDto } from 'src/auth/dto/signup.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: mongoose.Model<User>,
  ) {}

  // Method for get user by Email and return specific data
  async getUser(email: string, selectString?: string): Promise<User> {
    const user = await this.UserModel.findOne({ email, isActive: true }).select(
      selectString,
    );

    return user;
  }

  // Method for get user by ID
  async getUserById(id: mongoose.Types.ObjectId): Promise<User> {
    const user = await getOne(this.UserModel, id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  // Method for get all user
  async getAllUser(): Promise<User[]> {
    const users = await getAll(this.UserModel);

    if (!users || users.length === 0) {
      throw new NotFoundException('No users found.');
    }
    return users;
  }

  // Method for create user
  async createUser(data: CreateUserDto): Promise<User> {
    const user = createOne(this.UserModel, data);

    if (!user) {
      throw new BadRequestException('Error while creating user!');
    }

    return user;
  }

  // Method for update user by ID
  async updateUser(
    updateData: UpdateUserDto,
    id: mongoose.Types.ObjectId,
  ): Promise<User> {
    const user = await updateOne(this.UserModel, id, updateData);
    if (!user) {
      throw new BadRequestException('Error while updateing user!');
    }
    return user;
  }

  // Method for delete user by ID
  async deleteUser(id: mongoose.Types.ObjectId): Promise<void> {
    const deletedUser = await deleteOne(this.UserModel, id);

    if (!deletedUser) {
      throw new NotFoundException('User not found.');
    }
  }
}
