import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createOne, deleteOne, getOne, updateOne } from 'shared/handlerFactory';
import mongoose from 'mongoose';
import { Doctor } from './schema/doctor.schema';
import { FormDto } from './dto/updateDoctor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from 'src/auth/dto/signup.dto';
import { UpdateDoctor } from 'src/update-doctor/schema/updateDoctor.schema';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private DoctorModel: mongoose.Model<Doctor>,
  
  ) {}

  // Method for get doctor by Emial
  async getDoctor(email: string, selectString?: string): Promise<Doctor> {
    const doctor = await this.DoctorModel.findOne({
      email,
      isActive: true,
    }).select(selectString);

    return doctor;
  }

  // Method for get doctor by ID
  async getDoctorById(id: mongoose.Types.ObjectId): Promise<Doctor> {
    const doctor = await getOne(this.DoctorModel, id);

    if (!doctor) {
      throw new NotFoundException('Doctor not found!');
    }

    return doctor.populate('reviews');
  }

  // Method for get all doctors
  async getAllDoctor(query?: any): Promise<Doctor[]> {
    let doctors;

    const page = +query.page || 1;
    const limit = +query.limit || 1;
    const skip = (page - 1) * limit;

    // If query is provided, search by name or specialization
    if (query && Object.keys(query).length > 0 && query.search) {
      doctors = await this.DoctorModel.find({
        isActive: true,
        isApproved: 'approved',
        $or: [
          { name: { $regex: query.search, $options: 'i' } },
          { specialization: { $regex: query.search, $options: 'i' } },
        ],
      })
        .skip(skip)
        .limit(limit);
    } else {
      // If no query, get all approved doctors
      doctors = await this.DoctorModel.find({
        isApproved: 'approved',
        isActive: true,
      })
        .skip(skip)
        .limit(limit);
    }

    if (!doctors && Doctor.length === 0) {
      throw new NotFoundException('No doctor found!');
    }

    return doctors;
  }

  // Method for create doctor
  async createDoctor(data: CreateUserDto): Promise<Doctor> {
    const doctor = createOne(this.DoctorModel, data);

    if (!doctor) {
      throw new BadRequestException('Error while creating doctor');
    }

    return doctor;
  }

  // Method for update doctor
  async updateDoctor(
    id: mongoose.Types.ObjectId,
    updateData: UpdateDoctor,
  ): Promise<Doctor> {
    const doctor = await updateOne(this.DoctorModel, id, updateData);
    if (!doctor) {
      throw new BadRequestException('Error while updating doctor');
    }
    return doctor;
  }

  // Method for soft delete doctor
  async deleteDoctor(id: mongoose.Types.ObjectId): Promise<void> {
    await deleteOne(this.DoctorModel, id);
  }

  // Method for update doctor review
  async updateReviews(
    doctorId: mongoose.Types.ObjectId,
    reviewId: mongoose.Types.ObjectId,
  ) {
    await this.DoctorModel.findByIdAndUpdate(
      doctorId,
      { $push: { reviews: reviewId } },
      { new: true },
    );
    // const doctor = await this.DoctorModel.findById(doctorId);
    // doctor.reviews.push(reviewId);
    // await doctor.save();
  }

  // Method for update doctor rating
  async updateDoctroRatings(
    doctorId: mongoose.Types.ObjectId,
    totalRating: number,
    averageRating: number,
  ) {
    await this.DoctorModel.findByIdAndUpdate(
      doctorId,
      { $set: { totalRating: totalRating, averageRating: averageRating } },
      { new: true },
    );
  }

  // Method for add message to doctor
  async addMessage(
    doctorId: mongoose.Types.ObjectId,
    updateData: { message?: string; isApproved?: string },
  ) {
    const doctor = await updateOne(this.DoctorModel, doctorId, updateData);
    if (!doctor) {
      throw new BadRequestException('Error while updating doctor');
    }
    return doctor;
  }

  // Method for find doctor base on reset token
  async getDoctorByToken(token: string): Promise<Doctor> {
    return await this.DoctorModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
  }

  // Method for find doctor base on status
  async getDoctorByStatus(status: string, query: any): Promise<Doctor[]> {
    const page = +query.page || 1;
    const limit = +query.limit || 1;
    const skip = (page - 1) * limit;

    return await this.DoctorModel.find({ isApproved: status, isActive: true })
      .skip(skip)
      .limit(limit);
  }

 
}
