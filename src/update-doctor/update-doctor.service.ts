import mongoose from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateDoctor, UpdateTimeslot } from './schema/updateDoctor.schema';
import { FormDto } from 'src/doctor/dto/updateDoctor.dto';
import { getOne } from 'shared/handlerFactory';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class UpdateDoctorService {
  constructor(
    @InjectModel(UpdateDoctor.name)
    private UpdateDoctorModel: mongoose.Model<UpdateDoctor>,
    private socketGateway: SocketGateway,
  ) {}

  // Method for create and update dummy update doctor
  async upsertUpdateDoctor(
    id: mongoose.Types.ObjectId,
    doctorData: { formData: FormDto; timeslots: UpdateTimeslot[] },
  ): Promise<UpdateDoctor> {
    const updateDoctor = await this.UpdateDoctorModel.findOneAndUpdate(
      { _id: id },
      { $set: { ...doctorData.formData, timeslots: doctorData.timeslots } },
      { upsert: true, new: true },
    );

    if (!updateDoctor) {
      throw new BadRequestException(
        'Error while creating doctor updation request',
      );
    }
    this.socketGateway.emitDoctorRequestToAdmin(updateDoctor);
    return updateDoctor;
  }

  // Method for count  number of upadte doctor request
  async updateDoctorsNumber(): Promise<number> {
    return await this.UpdateDoctorModel.countDocuments();
  }

  // Method for get doctor data by id
  async getDoctorById(id: mongoose.Types.ObjectId): Promise<UpdateDoctor> {
    return await getOne(this.UpdateDoctorModel, id);
  }

  // Method for delete doctor
  async deleteDoctorById(id: mongoose.Types.ObjectId): Promise<UpdateDoctor> {
    return await this.UpdateDoctorModel.findByIdAndDelete(id);
  }
}
