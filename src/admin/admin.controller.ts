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

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private doctorService: DoctorService,
    private mailService: MailerService,
  ) {}

  // Endpoint for get admin profile
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Get('/profile')
  async getAdmin(@Req() req: any): Promise<Admin> {
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
  async getDoctor(@Req() req: any, @Query() query?: any) {
    const { status } = query;
    console.log(query);
    console.log(status);
    if (status === 'requests') {
      return await this.adminService.getRequestDoctors(req.user.userId, query);
    } else if (status === 'approved' || status === 'cancelled') {
      return await this.doctorService.getDoctorByStatus(status, query);
    }
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
    @Req() req: any,
  ) {
    // Check doctor is present or not
    const doctor = await this.doctorService.getDoctorById(doctorId);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (
      message &&
      (doctor.isApproved === 'pending' || doctor.isApproved === 'approved')
    ) {
      await this.doctorService.addMessage(doctorId, {
        message,
        isApproved: 'cancelled',
      });
    } else {
      await this.doctorService.addMessage(doctorId, { isApproved: 'approved' });
    }

    this.mailService.sendMail({
      from: process.env.EMAIL_FROM,
      to: doctor.email,
      subject: 'Life Link Application Status',
      text: `Your application has been ${message ? `rejected due to: ${message}` : 'approved'}.`,
    });

    return await this.adminService.removeDoctorId(req.user.userId, doctorId);
  }
}
