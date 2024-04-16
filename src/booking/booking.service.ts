import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import Stripe from 'stripe';
import mongoose from 'mongoose';
import { BookingDto } from './dto/booking.dto';

import { DoctorService } from 'src/doctor/doctor.service';
import { UserService } from 'src/user/user.service';
import { TimeslotService } from 'src/timeslot/timeslot.service';
import { InjectModel } from '@nestjs/mongoose';
import { Booking } from './schema/booking.schema';

@Injectable()
export class BookingService {
  private stripe: Stripe;
  constructor(
    @InjectModel(Booking.name) private BookingModel: mongoose.Model<Booking>,
    private doctorService: DoctorService,
    private userService: UserService,
    private timeslotService: TimeslotService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_KEY);
  }

  async getAppointmentUserId(userId: mongoose.Types.ObjectId) {
    return this.BookingModel.find({ user: userId });
  }

  async getCheckoutSession(
    doctorId: mongoose.Types.ObjectId,
    bookingData: BookingDto,
    req: any,
  ): Promise<void> {
    const { time, bookingDate } = bookingData;
    const doctor = await this.doctorService.getDoctorById(doctorId);
    const user = await this.userService.getUserById(req.user.userId);

    if (!doctor && !user) {
      throw new NotFoundException('User or Doctor not Found');
    }

    const bookingDetails = await this.BookingModel.findOne({
      docter: doctor._id,
      user: user._id,
      bookingDate: bookingDate,
    });

    if (bookingDetails) {
      throw new ConflictException(
        'User already book appointment with this docter today',
      );
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${process.env.CLINET_SITE}`,
        cancel_url: `${req.protocol}://${req.get('host')}/doctors/${doctor._id}`,
        mode: 'payment',
        customer_email: user.email,
        client_reference_id: doctorId.toString(),
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: doctor.fees * 100,
              product_data: {
                name: doctor.name,
                description: doctor.bio,
                images: [doctor.photo],
              },
            },
            quantity: 1,
          },
        ],
      });
      console.log(session);
      const timeslot = await this.timeslotService.getTimeslotByData(
        bookingData,
        doctorId,
      );

      this.timeslotService.addBookingData(bookingDate, timeslot._id);

      //create new booking
      const booking = await this.BookingModel.create({
        time,
        bookingDate,
        doctor: doctor._id,
        user: user._id,
        fees: doctor.fees,
        session: session.id,
      });
      console.log(booking);
    } catch (error) {
      console.log(error);
    }
  }
}
