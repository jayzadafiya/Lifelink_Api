import { BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';

type Model<T> = mongoose.Model<T>;

// Function to retrieve a single document by its ID
export const getOne = async <T>(
  model: Model<T>,
  id: mongoose.Types.ObjectId,
): Promise<T | null> => {
  return model.findById(id);
};

// Function to retrieve multiple documents based on options
export const getAll = async <T>(
  model: Model<T>,
  options?: any,
): Promise<T[] | null> => {
  return model.find(options);
};

// Function to create a new document
export const createOne = async <T>(
  model: Model<T>,
  bodyData: any,
): Promise<T | null> => {
  return model.create(bodyData);
};

// Function to update a document by its ID
export const updateOne = async (
  model: any,
  id: mongoose.Types.ObjectId,
  updateData: any,
): Promise<any> => {
  const keys: string[] = Object.keys(updateData);

  // Check if the update data contains sensitive fields like password
  if (keys.includes('password') || keys.includes('passwordConfirm')) {
    throw new BadRequestException('You can not directly change password ');
  }
  return await model.findOneAndUpdate(
    { _id: id, isActive: true },
    { $set: updateData },
    { new: true },
  );
};

// Function to delete a document by its ID
export const deleteOne = async (
  model: any,
  id: mongoose.Types.ObjectId,
): Promise<string | null> => {
  const deletedUser = await model.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true },
  );

  if (!deletedUser)
    throw new BadRequestException('Error while Delete operation ');

  return 'Delete Operation done successfully';
};
