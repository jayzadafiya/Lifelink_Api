import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { DoctorService } from 'src/doctor/doctor.service';
import { UserService } from 'src/user/user.service';
import Stripe from 'stripe';
@Injectable()
export class BookingService {
  private stripe: Stripe;
  constructor(
    private doctorService: DoctorService,
    private userService: UserService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_KEY);
  }

  async getCheckoutSession(
    doctorId: mongoose.Types.ObjectId,
    req: any,
  ): Promise<object> {
    const doctor = await this.doctorService.getDoctorById(doctorId);
    const user = await this.userService.getUserById(req.user.userId);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${process.env.CLIENT_SITE}`,
      cancel_url: `${req.protocol}://${req.get('host')}/doctors/${doctor._id}`,
      mode: 'payment',
      customer_email: user.email,
      client_reference_id: doctor._id,
      line_items: [
        {
          price_data: {
            currency: 'inr',
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

    //create new booking
    // const booking = await this.BookingModel.create({
    //   doctor: doctor._id,
    //   user: user._id,
    //   fees: doctor.fees,
    //   session: session.id,
    // });

    return session;
  }
}
