import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prescription } from './schema/prescription.schema';
import mongoose from 'mongoose';
import { createPrescriptionDto } from './dto/createPrescription.dto';
import { createOne } from 'shared/handlerFactory';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel(Prescription.name)
    private PrescriptionModel: mongoose.Model<Prescription>,
  ) {}

  // Method for creating prescription
  async createPrescription(
    prescriptionData: createPrescriptionDto,
    id: mongoose.Types.ObjectId,
  ): Promise<Prescription> {
    const prescription = await createOne(this.PrescriptionModel, {
      ...prescriptionData,
      booking: id,
    });

    if (!prescription) {
      throw new BadRequestException('Error while creating prescription');
    }

    return prescription;
  }

  // Method for find prescription by booking id
  async getPrescriptonById(id: mongoose.Types.ObjectId): Promise<Prescription> {
    return await this.PrescriptionModel.findOne({ booking: id }).populate({
      path: 'booking',
      select: 'user doctor',
    });
  }

  // Method for update prescription by booking id
  async updatePrescription(
    prescriptionData: createPrescriptionDto,
    id: mongoose.Types.ObjectId,
  ) {
    const prescription = await this.PrescriptionModel.findOneAndUpdate(
      { booking: id },
      { ...prescriptionData, booking: id },
      { new: true },
    );

    if (!prescription) {
      throw new BadRequestException('Error while updateing prescription');
    }
    return prescription;
  }
}
