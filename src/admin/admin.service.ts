import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './schema/admin.schema';
import mongoose from 'mongoose';
import { CreateAdminDto } from './dto/createAdmin.dto';
import { createOne } from 'shared/handlerFactory';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: mongoose.Model<Admin>,
  ) {}

  // Method for creating admin
  async createAdmin(adminData: CreateAdminDto) {
    const admin = await createOne(this.adminModel, adminData);

    if (!admin) {
      throw new BadRequestException('Error while creating admin');
    }

    return admin;
  }

  // Method for get admin by email
  async getAdmin(email: string, selectString?: string): Promise<Admin> {
    return await this.adminModel.findOne({ email }).select(selectString);
  }

  // Method for get admin by Id and docor base on pagination
  async getAdminById(id: mongoose.Types.ObjectId, query: any): Promise<Admin> {
    // return this.adminModel.findById(id).populate('doctors');
    const page = +query.page || 1;
    const limit = +query.limit || 1;
    const skip = (page - 1) * limit;

    return this.adminModel
      .findById(id)
      .populate({
        path: 'doctors',
        options: {
          limit: limit,
          skip: skip,
        },
      })
      .exec();
  }

  // Method for add doctor to request list
  async addDoctorRequest(doctorId: mongoose.Types.ObjectId): Promise<void> {
    await this.adminModel.findOneAndUpdate(
      { role: 'admin' },
      { $addToSet: { doctors: doctorId } },
      { new: true },
    );
  }

  // Method for remove doctor from request list
  async removeDoctorId(
    adminId: mongoose.Types.ObjectId,
    doctorId: mongoose.Types.ObjectId,
  ): Promise<void> {
    // check that is doctor id is present  in array
    const admin = await this.adminModel.findOne({
      _id: adminId,
      doctors: doctorId,
    });

    if (!admin) {
      throw new NotFoundException(
        'Given doctor id does not exist in request array',
      );
    }

    await this.adminModel.findOneAndUpdate(
      { role: 'admin' },
      { $pull: { doctors: doctorId } },
      { new: true },
    );
  }
}
