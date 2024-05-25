import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateDoctor, UpdateTimeslot } from './schema/updateDoctor.schema';
import { FormDto } from 'src/doctor/dto/updateDoctor.dto';
import { getOne } from 'shared/handlerFactory';

@Injectable()
export class UpdateDoctorService {
  constructor(
    @InjectModel(UpdateDoctor.name)
    private UpdateDoctorModel: mongoose.Model<UpdateDoctor>,
  ) {}

  // Method for create and update dummy update doctor
  async upsertDummyupdateDoctor(
    id: mongoose.Types.ObjectId,
    doctorData: { formData: FormDto; timeslots: UpdateTimeslot[] },
  ): Promise<boolean> {
    const res = await this.UpdateDoctorModel.updateOne(
      { _id: id },
      { $set: { ...doctorData.formData, timeslots: doctorData.timeslots } },
      { upsert: true, new: true },
    );
    return res.acknowledged;
  }

  // Method for get doctor data by id
  async getDoctorById(id: mongoose.Types.ObjectId): Promise<UpdateDoctor> {
    return await getOne(this.UpdateDoctorModel, id);
  }

  // Method for delete doctor
  async deleteDoctorById(id: mongoose.Types.ObjectId): Promise<UpdateDoctor> {
    const doctor = this.UpdateDoctorModel.findByIdAndDelete(id);

    return doctor;
  }
}
