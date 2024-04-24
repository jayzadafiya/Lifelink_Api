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
import { Doctor } from './schema/doctor.schema';
import { FormDto } from './dto/updateDoctor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from 'src/auth/dto/signup.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private DoctorModel: mongoose.Model<Doctor>,
  ) {}

  // Method for get doctor by Emial
  async getDoctor(email: string, selectString?: string): Promise<Doctor> {
    const doctor = await this.DoctorModel.findOne({ email }).select(
      selectString,
    );

   

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
  async getAllDoctor(query?: string): Promise<Doctor[]> {
    let doctors;

    // If query is provided, search by name or specialization
    if (query && Object.keys(query).length > 0) {
      doctors = await this.DoctorModel.find({
        isApproved: 'approved',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { specialization: { $regex: query, $options: 'i' } },
        ],
      });
    } else {
      // If no query, get all approved doctors
      doctors = await getAll(this.DoctorModel, { isApproved: 'approved' });
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
    updateData: FormDto,
  ): Promise<Doctor> {
    const doctor = updateOne(this.DoctorModel, id, updateData);

    if (!doctor) {
      throw new BadRequestException('Error while updating doctor');
    }
    return doctor;
  }

  // Method for delete doctor
  async deleteDoctor(id: mongoose.Types.ObjectId): Promise<string> {
    return deleteOne(this.DoctorModel, id);
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
      { totalRating: totalRating, averageRating: averageRating },

      { new: true },
    );
  }
}
