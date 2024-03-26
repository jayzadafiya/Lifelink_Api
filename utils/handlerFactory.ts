import { BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

type Model<T> = mongoose.Model<T>;

export const getOne = async <T>(
  model: Model<T>,
  id: string,
): Promise<T | null> => {
  return model.findById(id);
};

export const getAll = async <T>(model: Model<T>): Promise<T[] | null> => {
  return model.find();
};

export const updateOne = async <T>(
  model: Model<T>,
  id: string,
  updateData: UpdateUserDto,
): Promise<T | null> => {
  const keys: string[] = Object.keys(updateData);
  if (keys.includes('password') || keys.includes('passwordConfirm')) {
    throw new BadRequestException('You can not directly change password ');
  }
  return model.findByIdAndUpdate(id, { $set: updateData }, { new: true });
};

export const deleteOne = async <T>(
  model: Model<T>,
  id: string,
): Promise<string | null> => {
  const deletedUser = await model.findByIdAndDelete(id);

  if (!deletedUser)
    throw new BadRequestException(
      'Status Faild!!  Error while Delete operation ',
    );

  return 'Delete Operation done successfully';
};
