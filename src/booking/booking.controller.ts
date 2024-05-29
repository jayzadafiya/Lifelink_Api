import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import { BookingService } from './booking.service';
import { RolesGuard } from 'shared/role/role.gurd';
import { BookingDto } from './dto/booking.dto';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';

@Controller()
export class BookingController {
  constructor(private bookingService: BookingService) {}

  // Endpoint for create stripe checkout session
  @UseGuards(RolesGuard)
  @Roles(Role.Patient)
  @Post('checkout-session/:doctor_id')
  async getCheckoutsession(
    @Param('doctor_id') doctorId: mongoose.Types.ObjectId,
    @Body() bookingData: BookingDto,
    @Req() req: any,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    return await this.bookingService.getCheckoutSession(
      doctorId,
      bookingData,
      req,
    );
  }

  // Endpoint for chacking session status and it's call automatically by stripe
  @Post('/webhook')
  async stripeWebhook(@Req() req: any) {
    return await this.bookingService.stripeWebhook(req);
  }

  // Endpoint for give refund to user
  @UseGuards(RolesGuard)
  @Roles(Role.Doctor)
  @Patch('/refund/:booking_id')
  async giveRefund(
    @Param('booking_id') bookingId: mongoose.Types.ObjectId,
  ): Promise<void> {
    await this.bookingService.refundPayment(bookingId);
  }
}
