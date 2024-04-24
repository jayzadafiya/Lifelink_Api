import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Timeslots } from './schema/timeslot.schema';
import { createOne } from 'shared/handlerFactory';
import { SeparatedTimeSlots } from './timeslot.interface';
import { BookingDto } from 'src/booking/dto/booking.dto';

@Injectable()
export class TimeslotService {
  constructor(
    @InjectModel(Timeslots.name)
    private TimeslotModel: mongoose.Model<Timeslots>,
  ) {}

  // Method to retrieve a timeslot by booking dat
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

  // Method to create timeslots for a doctor
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

  // Method to get timeslots for a doctor by doctorID
  async getDoctorSlots(
    doctorId: mongoose.Types.ObjectId,
  ): Promise<SeparatedTimeSlots[]> {
    // const separatedTimeslots = await this.TimeslotModel.aggregate([
    //   { $match: { doctor: doctorId } },
    //   {
    //     $group: {
    //       _id: '$slotPhase',
    //       times: { $push: '$time' },
    //       bookingDate: { $addToSet: '$bookingDate' },
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       slotPhase: '$_id',
    //       times: 1,
    //       bookingDate: 1,
    //     },
    //   },
    // ]);

    const separatedTimeslots = await this.TimeslotModel.aggregate([
      { $match: { doctor: doctorId } },
      {
        $group: {
          _id: {
            slotPhase: '$slotPhase',
            time: '$time',
            bookingDate: '$bookingDate',
          },
        },
      },
      { $sort: { '_id.time': 1 } },
      {
        $group: {
          _id: '$_id.slotPhase',
          slots: {
            $push: {
              time: '$_id.time',
              bookingDate: '$_id.bookingDate',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          slotPhase: '$_id',
          slots: 1,
        },
      },
    ]).exec();

    if (!separatedTimeslots) {
      throw new BadRequestException('SeparateTimeslot not generate');
    }

    //formate this timeslots in array of object like [{slotphase:slots}]
    const formattedTimeslots = separatedTimeslots.map(
      ({ slotPhase, slots }) => ({
        [slotPhase]: slots,
      }),
    );

    return formattedTimeslots;
  }

  // Method to delete timeslots for a doctor by slotPhase
  async deleteTimeslots(
    doctorId: mongoose.Types.ObjectId,
    slotPhase: string,
  ): Promise<void> {
    const timeslot = await this.TimeslotModel.deleteMany({
      doctor: doctorId,
      slotPhase: slotPhase,
    });

    if (!timeslot) {
      throw new BadRequestException('Error while updating timeslot');
    }
  }

  // Method to add booking data to a timeslot
  async addBookingData(
    bookingDate: string,
    timeslotId: mongoose.Types.ObjectId,
  ): Promise<void> {
    const timeslot = await this.TimeslotModel.findByIdAndUpdate(
      timeslotId,
      { $push: { bookingDate: bookingDate } },
      { new: true },
    );

    if (!timeslot) {
      throw new BadRequestException('Error while updating timeslot');
    }
  }
}
