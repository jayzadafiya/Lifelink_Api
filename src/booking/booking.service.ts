import { Injectable } from '@nestjs/common';

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

  async getCheckoutSession(
    doctorId: mongoose.Types.ObjectId,
    bookingData: BookingDto,
    req: any,
  ): Promise<void> {
    const doctor = await this.doctorService.getDoctorById(doctorId);
    const user = await this.userService.getUserById(req.user.userId);

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

      this.timeslotService.addBookingData(
        bookingData.bookingDate,
        timeslot._id,
      );

      //create new booking
      const booking = await this.BookingModel.create({
        doctor: doctor._id,
        user: user._id,
        fees: doctor.fees,
        session: session.id,
        time: bookingData.time,
      });
      console.log(booking);
    } catch (error) {
      console.log(error);
    }
  }
}
