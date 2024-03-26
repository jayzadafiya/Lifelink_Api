import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import mongoose from 'mongoose';
import { CreateUserDto } from 'src/auth/dto/signup.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { deleteOne, getAll, getOne, updateOne } from 'utils/handlerFactory';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: mongoose.Model<User>,
  ) {}

  async getUser(email: string, selectString?: string): Promise<User> {
    return await this.UserModel.findOne({ email }).select(selectString);
  }

  async getUserById(id: string): Promise<User> {
    return getOne(this.UserModel, id);
  }

  async getAllUser(): Promise<User[]> {
    return getAll(this.UserModel);
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return await this.UserModel.create(data);
  }

  async updateUser(updateData: UpdateUserDto, id: string): Promise<User> {
    return updateOne(this.UserModel, id, updateData);
  }

  async deleteUser(id: string): Promise<string> {
    return deleteOne(this.UserModel, id);
  }
}
