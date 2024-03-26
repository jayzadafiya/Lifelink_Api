import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor } from './schema/doctor.schema';
import { CreateUserDto } from 'src/auth/dto/signup.dto';
import { deleteOne, getAll, getOne, updateOne } from 'utils/handlerFactory';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private DoctorModel: mongoose.Model<Doctor>,
  ) {}

  async getDoctor(email: string, selectString?: string): Promise<Doctor> {
    return await this.DoctorModel.findOne({ email }).select(selectString);
  }

  async getDoctorById(id: string): Promise<Doctor> {
    return getOne(this.DoctorModel, id);
  }

  async getAllDoctor(): Promise<Doctor[]> {
    return getAll(this.DoctorModel);
  }

  async createDoctor(data: CreateUserDto): Promise<Doctor> {
    return await this.DoctorModel.create(data);
  }

  async updateDoctor(updateData: UpdateUserDto, id: string): Promise<Doctor> {
    return updateOne(this.DoctorModel, id, updateData);
  }

  async deleteDoctor(id: string): Promise<string> {
    return deleteOne(this.DoctorModel, id);
  }
}
