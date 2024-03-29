import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment } from './schema/appointment.schema';
import mongoose from 'mongoose';
import { DoctorService } from 'src/doctor/doctor.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private AppointmentModel: mongoose.Model<Appointment>,

    private doctorService: DoctorService,
  ) {}

  async getAppointmentUserId(
    userId: mongoose.Types.ObjectId,
  ): Promise<Appointment[]> {
    return this.AppointmentModel.find({ user: userId });
  }


}
