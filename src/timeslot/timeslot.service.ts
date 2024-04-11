import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Timeslots } from './schema/timeslot.schema';
import mongoose from 'mongoose';
import { createOne } from 'shared/handlerFactory';
import { SeparatedTimeSlots } from './timeslot.interface';

@Injectable()
export class TimeslotService {
  constructor(
    @InjectModel(Timeslots.name)
    private TimeslotModel: mongoose.Model<Timeslots>,
  ) {}

  async createTimeslots(
    doctorId: mongoose.Types.ObjectId,
    timeslots: SeparatedTimeSlots[],
  ): Promise<void> {
    for (const slot of timeslots) {
      const slotName = Object.keys(slot)[0];
      const times = slot[slotName];

      for (const time of times) {
        const data = { time, doctor: doctorId, slotPhase: slotName };
        await createOne(this.TimeslotModel, data);
      }
    }
  }
}
