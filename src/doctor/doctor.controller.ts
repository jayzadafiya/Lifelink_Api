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
import { TimeslotService } from 'src/timeslot/timeslot.service';
import { BookingService } from 'src/booking/booking.service';
import { Booking } from 'src/booking/schema/booking.schema';
import { TimeslotDTO } from 'src/timeslot/dto/createTimeslot.dto';
import { AdminService } from 'src/admin/admin.service';
import { User } from 'src/user/schema/user.schema';

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

  // // Endpoint for update doctor
  // @UseGuards(RolesGuard)
  // @Roles(Role.Doctor)
  // @Put('/:id')
  // async updateDoctor(
  //   @Req() req: any,
  //   @Body() updateData: UpdateDoctorDto,
  //   @Param('id') doctorId: mongoose.Types.ObjectId,
  // ): Promise<Doctor> {
  //   if (req.user.userId !== doctorId) {
  //     throw new UnauthorizedException(
  //       "You don't have access to update this user",
  //     );
  //   }

  //   const { formData, timeSlots } = updateData;

  //   // If new timeslots are provided, create them
  //   if (timeSlots) {
  //     await this.timeslotService.createTimeslots(doctorId, timeSlots);
  //   }

  //   const updateDoctor = await this.doctorService.updateDoctor(
  //     doctorId,
  //     formData,
  //   );

  //   if (updateDoctor) {
  //     await this.adminService.addDoctorRequest(updateDoctor._id);
  //   }

  //   return updateDoctor;
  // }

  // Endpoint for delete doctor
  @UseGuards(RolesGuard)
  @Roles(Role.Doctor, Role.Admin)
  @Patch('/:id')
  async deleteDoctor(
    @Req() req: any,
    @Param('id') doctorId: mongoose.Types.ObjectId,
  ): Promise<{
    hasBookings: boolean;
    bookingData?: { date: string; time: string; user: User }[];
  }> {
    // 1. check provide id is valid or not
    if (req.user.role === 'admin') {
      const doctor = await this.doctorService.getDoctorById(doctorId);

      if (doctor) {
        throw new BadRequestException('Please provide valid ID');
      }
    }
    if (req.user.role === Role.Doctor) {
      if (req.user.userId !== doctorId) {
        throw new UnauthorizedException(
          "You don't have access to delete this user",
        );
      }
    }

    // check is there is any future appointment exist and if not then delete doctor
    const upcomingAppointment =
      await this.bookingService.getUpcomingBookingsForDoctor(doctorId);
    if (upcomingAppointment.length > 0) {
      const bookingData = upcomingAppointment.map((appointment) => ({
        date: appointment.bookingDate,
        time: appointment.time,
        user: appointment.user,
      }));
      return { hasBookings: true, bookingData };
    } else {
      await this.doctorService.deleteDoctor(doctorId);
      return { hasBookings: false };
    }
  }

  // Endpoint for take confirmation for delete doctor
  @UseGuards(RolesGuard)
  @Roles(Role.Doctor, Role.Admin)
  @Patch('/:doctorId/confirm')
  async confirmAndDeleteDoctor(
    @Param('doctorId') doctorId: mongoose.Types.ObjectId,
  ): Promise<void> {
    const upcomingAppointment =
      await this.bookingService.getUpcomingBookingsForDoctor(doctorId);

    upcomingAppointment.map(async (appointment) => {
      // Make refund request and make bookking status to cancelled
      await this.bookingService.refundPayment(appointment._id);

      // Send SMS to user
      await this.bookingService.sendSMS(appointment);
    });

    await this.doctorService.deleteDoctor(doctorId);
  }
}
