import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Timeslots } from './schema/timeslot.schema';
import mongoose from 'mongoose';
import { createOne } from 'shared/handlerFactory';

@Injectable()
export class TimeslotService {
  constructor(
    @InjectModel(Timeslots.name)
    private TimeslotModel: mongoose.Model<Timeslots>,
  ) {}

  async createTimeslots(
    doctorId: mongoose.Types.ObjectId,
    timeslots: string[],
  ): Promise<void> {
    timeslots.forEach(async (timeslot) => {
      const data = { time: timeslot, doctor: doctorId };
      await createOne(this.TimeslotModel, data);
    });
  }
}
