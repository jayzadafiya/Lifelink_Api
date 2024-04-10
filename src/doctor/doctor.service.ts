import mongoose, { ObjectId } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor } from './schema/doctor.schema';
import { CreateUserDto } from 'src/auth/dto/signup.dto';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from 'shared/handlerFactory';
import { FormDto } from './dto/updateDoctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private DoctorModel: mongoose.Model<Doctor>,
  ) {}

  async getDoctor(email: string, selectString?: string): Promise<Doctor> {
    return await this.DoctorModel.findOne({ email }).select(selectString);
  }

  async getDoctorById(id: mongoose.Types.ObjectId): Promise<Doctor> {
    const doctor = await getOne(this.DoctorModel, id);

    return doctor.populate('reviews');
  }

  async getAllDoctor(query?: string): Promise<Doctor[]> {
    let doctors;
    if (query && Object.keys(query).length > 0) {
      doctors = await this.DoctorModel.find({
        isApproved: 'approved',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { specialization: { $regex: query, $options: 'i' } },
        ],
      });
    } else {
      doctors = await getAll(this.DoctorModel, { isApproved: 'approved' });
    }

    return doctors;
  }

  async createDoctor(data: CreateUserDto): Promise<Doctor> {
    return createOne(this.DoctorModel, data);
  }

  async updateDoctor(
    id: mongoose.Types.ObjectId,
    updateData: FormDto,
  ): Promise<Doctor> {
    return updateOne(this.DoctorModel, id, updateData);
  }

  async deleteDoctor(id: mongoose.Types.ObjectId): Promise<string> {
    return deleteOne(this.DoctorModel, id);
  }

  async updateReviews(doctorId: mongoose.Types.ObjectId, reviewId: ObjectId) {
    await this.DoctorModel.findByIdAndUpdate(
      doctorId,
      { $push: { reviews: reviewId } },
      { new: true },
    );
    // const doctor = await this.DoctorModel.findById(doctorId);
    // doctor.reviews.push(reviewId);
    // await doctor.save();
  }

  async updateDoctroRatings(
    doctorId: mongoose.Types.ObjectId,
    totalRating: number,
    averageRating: number,
  ) {
    await this.DoctorModel.findByIdAndUpdate(
      doctorId,
      { totalRating: totalRating, averageRating: averageRating },

      { new: true },
    );
  }

  async getDoctorFromAppointment(
    doctorId: mongoose.Types.ObjectId[],
  ): Promise<Doctor[]> {
    return this.DoctorModel.find({ _id: { $in: doctorId } });
  }
}
