import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Timeslots } from './schema/timeslot.schema';
import mongoose from 'mongoose';
import { createOne } from 'shared/handlerFactory';
import { SeparatedTimeSlots } from './timeslot.interface';
import { BookingDto } from 'src/booking/dto/booking.dto';

@Injectable()
export class TimeslotService {
  constructor(
    @InjectModel(Timeslots.name)
    private TimeslotModel: mongoose.Model<Timeslots>,
  ) {}

  async getTimeslotByData(
    bookingData: BookingDto,
    doctorId: mongoose.Types.ObjectId,
  ): Promise<Timeslots> {
    const { time, slotPhase } = bookingData;

    const timeslot = await this.TimeslotModel.findOne({
      time: time,
      slotPhase: slotPhase,
      doctor: doctorId,
    });

    if (!timeslot) {
      throw new NotFoundException('Timeslot not found for this data');
    }

    return timeslot;
  }

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

  async getDoctorSlots(
    doctorId: mongoose.Types.ObjectId,
  ): Promise<SeparatedTimeSlots[]> {
    const separatedTimeslots = await this.TimeslotModel.aggregate([
      { $match: { doctor: doctorId } },
      {
        $group: {
          _id: '$slotPhase',
          times: { $push: '$time' },
        },
      },
      {
        $project: {
          _id: 0,
          slotPhase: '$_id',
          times: 1,
        },
      },
    ]).exec();

    const formattedTimeslots = separatedTimeslots.map(
      ({ slotPhase, times }) => ({ [slotPhase]: times }),
    );

    return formattedTimeslots;
  }

  async deleteTimeslots(
    doctorId: mongoose.Types.ObjectId,
    slotPhase: string,
  ): Promise<void> {
    await this.TimeslotModel.deleteMany({
      doctor: doctorId,
      slotPhase: slotPhase,
    });
  }

  async addBookingData(
    bookingDate: string,
    timeslotId: mongoose.Types.ObjectId,
  ): Promise<void> {
    await this.TimeslotModel.findByIdAndUpdate(
      timeslotId,
      { $push: { bookingDate: bookingDate } },
      { new: true },
    );
  }
}
