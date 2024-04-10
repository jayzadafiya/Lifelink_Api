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
import { DoctorService } from './doctor.service';
import { Doctor } from './schema/doctor.schema';
import { RolesGuard } from 'shared/role/role.gurd';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';
import mongoose from 'mongoose';
import { Request } from 'express';
import { AppointmentService } from 'src/appointment/appointment.service';
import { Appointment } from 'src/appointment/schema/appointment.schema';
import { UpdateDoctorDto } from './dto/updateDoctor.dto';
import { TimeslotService } from 'src/timeslot/timeslot.service';

@Controller('/doctors')
export class DoctorController {
  constructor(
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
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
  ): Promise<{ doctorDetails: Doctor; appointments: Appointment[] }> {
    const doctor = await this.doctorService.getDoctorById(req.user.userId);

    if (!doctor) {
      throw new NotFoundException('Doctor not found!!');
    }

    const appointments = await this.appointmentService.getAppointmentUserId(
      doctor._id,
    );

    return { doctorDetails: doctor, appointments: appointments };
  }

  @Get('/:id')
  async getUser(@Param('id') id: mongoose.Types.ObjectId): Promise<Doctor> {
    return this.doctorService.getDoctorById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Doctor)
  @Put('/:id')
  async updateDoctor(
    @Body() updateData: UpdateDoctorDto,
    @Param('id') doctorId: mongoose.Types.ObjectId,
  ): Promise<any> {
    console.log(updateData);

    const { formData, timeSlots } = updateData;

    await this.timeslotService.createTimeslots(doctorId, timeSlots);

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
