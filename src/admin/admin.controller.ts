import mongoose from 'mongoose';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/createAdmin.dto';
import { RolesGuard } from 'shared/role/role.gurd';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';
import { Admin } from './schema/admin.schema';
import { DoctorService } from 'src/doctor/doctor.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdateDoctorService } from 'src/update-doctor/update-doctor.service';
import { TimeslotService } from 'src/timeslot/timeslot.service';
import { AuthRequest } from 'shared/request.interface';
import { DonorService } from 'src/donor/donor.service';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private doctorService: DoctorService,
    private updateDoctorService: UpdateDoctorService,
    private timeslotService: TimeslotService,
    private donorService: DonorService,
    private mailService: MailerService,
  ) {}

  // Endpoint for get admin profile
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Get('/profile')
  async getAdmin(@Req() req: AuthRequest): Promise<Admin> {
    const admin = await this.adminService.getAdmin(req.user.email);
    if (!admin) {
      throw new NotFoundException('Admin not found!!');
    }
    return admin;
  }

  // Endpoint for get doctors from query
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Get('/doctors')
  async getDoctor(@Req() req: AuthRequest, @Query() query?: any) {
    const { status } = query;

    if (status === 'requests') {
      return await this.adminService.getRequestDoctors(req.user.userId, query);
    } else if (status === 'donor') {
      return await this.donorService.getDonors(query);
    } else if (status === 'approved' || status === 'cancelled') {
      return await this.doctorService.getDoctorByStatus(status, query);
    }
  }

  // Endpoint for show number fof each user
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Get('/report')
  async getReport(): Promise<{
    updateRequest: number;
    acceptedNumber: number;
    cancelledNumber: number;
    donorsNumber: number;
  }> {
    const donorsNumber = await this.donorService.donorsNumber();
    const { acceptedNumber, cancelledNumber } =
      await this.doctorService.doctorsNumber();
    const updateRequest = await this.updateDoctorService.updateDoctorsNumber();
    return {
      updateRequest,
      acceptedNumber,
      cancelledNumber,
      donorsNumber,
    };
  }

  // Endpoint for create admin
  @Post('/')
  async createAdmin(@Body() adminData: CreateAdminDto): Promise<Admin> {
    return await this.adminService.createAdmin(adminData);
  }

  // Endpoint for accept or reject doctor request
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Patch('/:id')
  async doctorQuery(
    @Param('id') doctorId: mongoose.Types.ObjectId,
    @Body('message') message: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    // Check doctor is present or not
    const doctor = await this.doctorService.getDoctorById(doctorId);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const isPendingOrApproved =
      doctor.isApproved === 'pending' || doctor.isApproved === 'approved';

    // Case when there is a message and the doctor is pending or approved
    if (message && isPendingOrApproved) {
      await this.doctorService.addMessage(doctorId, {
        message,
        isApproved: 'cancelled',
      });
    }
    // Case when there is no message and the doctor is pending or approved
    else if (!message && isPendingOrApproved) {
      const doctor = await this.updateDoctorService.deleteDoctorById(doctorId);

      await this.doctorService.updateDoctor(doctorId, doctor);
      await this.doctorService.addMessage(doctorId, {
        message: null,
        isApproved: 'approved',
      });
      await this.timeslotService.createTimeslots(doctorId, doctor.timeslots);
    }
    // Case when there is no message and the doctor is already cancelled
    else if (!message && doctor.isApproved === 'cancelled') {
      await this.doctorService.addMessage(doctorId, {
        message: null,
        isApproved: 'approved',
      });
    }

    this.mailService.sendMail({
      from: process.env.EMAIL_FROM,
      to: doctor.email,
      subject: 'Life Link Application Status',
      text: `Your application has been ${message ? `rejected due to: ${message}` : 'approved'}.`,
    });
    await this.adminService.removeDoctorId(req.user.userId, doctorId);
  }
}
