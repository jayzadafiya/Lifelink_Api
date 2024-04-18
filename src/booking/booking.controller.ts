import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { BookingService } from './booking.service';
import mongoose from 'mongoose';
import { RolesGuard } from 'shared/role/role.gurd';
import { BookingDto } from './dto/booking.dto';
import { Response } from 'express';

@Controller('/booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @UseGuards(RolesGuard)
  @Post('checkout-session/:doctorId')
  async getCheckoutsession(
    @Param('doctorId') doctorId: mongoose.Types.ObjectId,
    @Body() bookingData: BookingDto,
    @Req() req: any,
  ) {
    return this.bookingService.getCheckoutSession(doctorId, bookingData, req);
  }

  @Post('/webhook')
  async stripeWebhook(@Req() req: any, @Res() res: Response) {
    return this.bookingService.stripeWebhook(req, res);
  }
}
