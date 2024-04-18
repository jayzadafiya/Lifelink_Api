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
    this.stripe = new Stripe(process.env.STRIPE_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async createBooking(customer, doctorId: mongoose.Types.ObjectId, data) {
    // const {
    //   data: bookingData,
    //   userId,
    // }: {
    //   data: BookingDto;
    //   userId: mongoose.Types.ObjectId;
    // }

    const bookingData: BookingDto = JSON.parse(customer.metadata.data);
    const { userId } = customer.metadata;

    console.log(bookingData);

    const { time, bookingDate } = bookingData;

    const isPaid = data.payment_status ? true : false;

    const timeslot = await this.timeslotService.getTimeslotByData(
      bookingData,
      doctorId,
    );

    //timeslot not found handle in timeslotservice

    this.timeslotService.addBookingData(bookingDate, timeslot._id);
    // create new booking
    const booking = await this.BookingModel.create({
      time,
      bookingDate,
      doctor: doctorId,
      user: userId,
      fees: data.amount_total / 100,
      sessionCustomerId: data.customer,
      isPaid: isPaid,
    });
    console.log(booking);
  }

  async getAppointment(
    userType: string,
    id: mongoose.Types.ObjectId,
  ): Promise<{ upcoming: Booking[]; history: Booking[] }> {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];
    const currentTimeString = currentDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return this.BookingModel.aggregate([
      {
        $match: {
          [userType]: id,
        },
      },
      {
        $lookup: {
          from: 'users', // Assuming the collection name for users is 'users'
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user', // Deconstruct the user array produced by $lookup
      },
      {
        $lookup: {
          from: 'doctors', // Assuming the collection name for doctors is 'doctors'
          let: { doctorId: '$doctor' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$doctorId'] },
              },
            },
            {
              $project: {
                name: 1,
                email: 1,
                photo: 1,
              },
            },
          ],
          as: 'doctor',
        },
      },
      {
        $unwind: '$doctor', // Deconstruct the doctor array produced by $lookup
      },
      {
        $facet: {
          upcoming: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $gt: ['$bookingDate', currentDateString] },
                    {
                      $and: [
                        { $eq: ['$bookingDate', currentDateString] },
                        { $gt: ['$time', currentTimeString] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          history: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $lt: ['$bookingDate', currentDateString] },
                    {
                      $and: [
                        { $eq: ['$bookingDate', currentDateString] },
                        { $lte: ['$time', currentTimeString] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    ]).then((results) => {
      return {
        upcoming: results[0].upcoming,
        history: results[0].history,
      };
    });
  }

  async getCheckoutSession(
    doctorId: mongoose.Types.ObjectId,
    bookingData: BookingDto,
    req: any,
  ): Promise<any> {
    const { bookingDate } = bookingData;
    const doctor = await this.doctorService.getDoctorById(doctorId);
    const user = await this.userService.getUserById(req.user.userId);

    if (!doctor && !user) {
      throw new NotFoundException('User or Doctor not Found');
    }

    const bookingDetails = await this.BookingModel.findOne({
      doctor: doctor._id,
      user: user._id,
      bookingDate: bookingDate,
    });

    if (bookingDetails) {
      throw new ConflictException(
        'User already book appointment with this docter today',
      );
    }

    const customer = await this.stripe.customers.create({
      metadata: {
        userId: user._id.toString(),
        data: JSON.stringify(bookingData),
      },
    });

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${process.env.CLINET_SITE}`,
        cancel_url: `${req.protocol}://${req.get('host')}/doctors/${doctor._id}`,
        mode: 'payment',
        customer: customer.id,
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

      return session;
    } catch (error) {
      console.log(error);
    }
  }

  async stripeWebhook(req: any, res: any) {
    const sig = req.headers['stripe-signature'];

    try {
      const event = await this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        'whsec_85ce6a51cc9c29d450c8c65fd206dbb00020083e2d356c0ed837be6fca055e5c',
      );

      // console.log('datta', event.data);
      // console.log('body', req.body.data);
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;

          const doctorId = new mongoose.Types.ObjectId(
            session.client_reference_id,
          );

          const customerId = event?.data.object.customer;

          this.stripe.customers
            .retrieve(customerId.toString())
            .then((customer) => {
              console.log(customer);

              this.createBooking(customer, doctorId, event.data.object);
            });

          // console.log('request data', req.body?.data);

          console.log('checkout don');

          // console.log(sessionId, doctorId);
          break;
        case 'checkout.session.expired':
          // Handle failed session
          // handleFailedSession(event);
          console.log(event);
          break;
        // Handle other events if needed

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error('Webhook Error:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    res.status(200).json({ received: true });
  }
}
