import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { DoctorService } from './doctor.service';
import { Doctor } from './schema/doctor.schema';
import { RolesGuard } from 'shared/role/role.gurd';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';
import { Request } from 'express';
import { UpdateDoctorDto } from './dto/updateDoctor.dto';
import { TimeslotService } from 'src/timeslot/timeslot.service';
import { SeparatedTimeSlots } from 'src/timeslot/timeslot.interface';
import { BookingService } from 'src/booking/booking.service';
import { Booking } from 'src/booking/schema/booking.schema';

@Controller('/doctors')
export class DoctorController {
  constructor(
    private doctorService: DoctorService,
    private bookingService: BookingService,
    private timeslotService: TimeslotService,
  ) {}

  @Get('/')
  async getAllDoctor(@Query('query') query?: string): Promise<Doctor[]> {
    return this.doctorService.getAllDoctor(query);
  }

  @UseGuards(RolesGuard)
  @Get('/profile')
  async getDoctorProfile(
    @Req() req: Request | any,
  ): Promise<{
    doctorDetails: Doctor;
    appointments: { upcoming: Booking[]; history: Booking[] };
  }> {
    const doctor = await this.doctorService.getDoctorById(req.user.userId);

    if (!doctor) {
      throw new NotFoundException('Doctor not found!!');
    }

    const appointments = await this.bookingService.getAppointment(
      'doctor',
      doctor._id,
    );

    return { doctorDetails: doctor, appointments: appointments };
  }

  @Get('/:id')
  async getDoctorById(
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<{ doctor: Doctor; timeslots: SeparatedTimeSlots[] }> {
    const doctor = await this.doctorService.getDoctorById(id);

    const timeslots = await this.timeslotService.getDoctorSlots(id);

    return { doctor, timeslots };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Doctor)
  @Put('/:id')
  async updateDoctor(
    @Body() updateData: UpdateDoctorDto,
    @Param('id') doctorId: mongoose.Types.ObjectId,
  ): Promise<any> {
    const { formData, timeSlots } = updateData;

    if (timeSlots) {
      await this.timeslotService.createTimeslots(doctorId, timeSlots);
    }

    return this.doctorService.updateDoctor(doctorId, formData);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Doctor)
  @Delete('/:id')
  async deleteDoctor(
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<string> {
    return this.doctorService.deleteDoctor(id);
  }
}
