import { Controller, Param, Post, Req } from '@nestjs/common';
import { BookingService } from './booking.service';
import mongoose from 'mongoose';

@Controller()
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post('checkout-session/:doctorId')
  async getCheckoutsession(
    @Param('doctorId') doctorId: mongoose.Types.ObjectId,
    @Req() req: any,
  ) {
    return this.bookingService.getCheckoutSession(doctorId, req);
  }
}
