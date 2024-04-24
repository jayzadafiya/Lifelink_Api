import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { BookingService } from './booking.service';
import { RolesGuard } from 'shared/role/role.gurd';
import { BookingDto } from './dto/booking.dto';
import { Response } from 'express';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';

@Controller('/booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  // Endpoint for create stripe checkout session
  @UseGuards(RolesGuard)
  @Roles(Role.Patient)
  @Post('checkout-session/:doctorId')
  async getCheckoutsession(
    @Param('doctorId') doctorId: mongoose.Types.ObjectId,
    @Body() bookingData: BookingDto,
    @Req() req: any,
  ) {
    return this.bookingService.getCheckoutSession(doctorId, bookingData, req);
  }

  // Endpoint for chacking session status and it's call automatically by stripe
  @Post('/webhook')
  async stripeWebhook(@Req() req: any, @Res() res: Response) {
    return this.bookingService.stripeWebhook(req, res);
  }
}
