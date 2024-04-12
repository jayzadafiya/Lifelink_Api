import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import mongoose from 'mongoose';
import { RolesGuard } from 'shared/role/role.gurd';
import { BookingDto } from './dto/booking.dto';

@UseGuards(RolesGuard)
@Controller()
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post('checkout-session/:doctorId')
  async getCheckoutsession(
    @Param('doctorId') doctorId: mongoose.Types.ObjectId,
    @Body() bookingData: BookingDto,
    @Req() req: any,
  ) {
    return this.bookingService.getCheckoutSession(doctorId, bookingData, req);
  }
}
