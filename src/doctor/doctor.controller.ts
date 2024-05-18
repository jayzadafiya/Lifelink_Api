import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UnauthorizedException,
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
import { BookingService } from 'src/booking/booking.service';
import { Booking } from 'src/booking/schema/booking.schema';
import { TimeslotDTO } from 'src/timeslot/dto/createTimeslot.dto';
import { AdminService } from 'src/admin/admin.service';

@Controller('/doctors')
export class DoctorController {
  constructor(
    private doctorService: DoctorService,
    private bookingService: BookingService,
    private timeslotService: TimeslotService,
    private adminService: AdminService,
  ) {}

  // Endpoint for get all doctors
  @Get('/')
  async getAllDoctor(@Query() query?: any): Promise<Doctor[]> {
    return this.doctorService.getAllDoctor(query);
  }

  // Endpoint for get current doctor details and appointments
  @UseGuards(RolesGuard)
  @Get('/profile')
  async getDoctorProfile(@Req() req: Request | any): Promise<{
    doctorDetails: Doctor;
    appointments: { upcoming: Booking[]; history: Booking[] };
  }> {
    const doctor = await this.doctorService.getDoctorById(req.user.userId);

    if (!doctor) {
      throw new NotFoundException('Doctor not found!!');
    }

    // Retrieve appointments for the doctor
    const appointments = await this.bookingService.getAppointment(
      'doctor',
      doctor._id,
    );

    return { doctorDetails: doctor, appointments: appointments };
  }

  // Endpoint for get doctor details and timeslots
  @Get('/:id')
  async getDoctorById(
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<{ doctor: Doctor; timeslots: TimeslotDTO[] }> {
    const doctor = await this.doctorService.getDoctorById(id);

    // Retrieve timeslots for the doctor
    const timeslots = await this.timeslotService.getDoctorSlots(doctor._id);

    return { doctor, timeslots };
  }

  // Endpoint for update doctor
  @UseGuards(RolesGuard)
  @Roles(Role.Doctor)
  @Put('/:id')
  async updateDoctor(
    @Req() req: any,
    @Body() updateData: UpdateDoctorDto,
    @Param('id') doctorId: mongoose.Types.ObjectId,
  ): Promise<Doctor> {
    if (req.user.userId !== doctorId) {
      throw new UnauthorizedException(
        "You don't have access to update this user",
      );
    }

    const { formData, timeSlots } = updateData;

    // If new timeslots are provided, create them
    if (timeSlots) {
      await this.timeslotService.createTimeslots(doctorId, timeSlots);
    }

    const updateDoctor = await this.doctorService.updateDoctor(
      doctorId,
      formData,
    );

    if (updateDoctor) {
      await this.adminService.addDoctorRequest(updateDoctor._id);
    }

    return updateDoctor;
  }

  // Endpoint for delete doctor
  @UseGuards(RolesGuard)
  @Roles(Role.Doctor, Role.Admin)
  @Patch('/:id')
  async deleteDoctor(
    @Req() req: any,
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<void> {
    if (req.user.role === 'admin') {
      const user = await this.doctorService.getDoctorById(id);

      if (user) {
        throw new BadRequestException('Please provide valid ID');
      }
    }
    if (req.user.role === Role.Doctor) {
      if (req.user.userId !== id) {
        throw new UnauthorizedException(
          "You don't have access to delete this user",
        );
      }
    }

    await this.doctorService.deleteDoctor(id);
  }
}
