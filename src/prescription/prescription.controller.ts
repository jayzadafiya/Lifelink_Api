import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import mongoose from 'mongoose';
import { createPrescriptionDto } from './dto/createPrescription.dto';
import { Prescription } from './schema/prescription.schema';
import { BookingService } from 'src/booking/booking.service';
import { RolesGuard } from 'shared/role/role.gurd';
import { Role } from 'utils/role.enum';
import { Roles } from 'shared/role/role.decorator';

@UseGuards(RolesGuard)
@Roles(Role.Doctor, Role.Patient)
@Controller('prescription')
export class PrescriptionController {
  constructor(
    private prescriptionService: PrescriptionService,
    private bookingService: BookingService,
  ) {}

  // Endpoint for get prescription by bokingId
  @Get('/:id')
  async getPrescription(
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<Prescription> {
    //check booking is exists or not
    const booking = await this.bookingService.getBookingById(id);

    if (!booking) {
      throw new NotFoundException('Booking Data not found');
    }

    return await this.prescriptionService.getPrescriptonById(id);
  }

  // Endpoint for create prescription
  @Post('/:id')
  async createPrescription(
    @Param('id') bookingId: mongoose.Types.ObjectId,
    @Body() prescriptionData: createPrescriptionDto,
  ): Promise<Prescription> {
    //check booking is exists or not
    const booking = await this.bookingService.getBookingById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking Data not found');
    }

    const prescription = await this.prescriptionService.createPrescription(
      prescriptionData,
      bookingId,
    );

    if (prescription) {
      booking.status = 'complate';
      booking.save();
    }

    return prescription;
  }

  // Endpoint for update prescription
  @Patch('/:id')
  async updatePrescription(
    @Param('id') bookingId: mongoose.Types.ObjectId,
    @Body() prescriptionData: createPrescriptionDto,
  ): Promise<Prescription> {
    //check booking is exists or not
    const booking = await this.bookingService.getBookingById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking Data not found');
    }

    return await this.prescriptionService.updatePrescription(
      prescriptionData,
      bookingId,
    );
  }
}
