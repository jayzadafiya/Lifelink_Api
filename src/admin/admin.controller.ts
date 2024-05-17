import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/createAdmin.dto';
import { RolesGuard } from 'shared/role/role.gurd';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';
import { Admin } from './schema/admin.schema';
import mongoose from 'mongoose';
import { DoctorService } from 'src/doctor/doctor.service';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private doctorService: DoctorService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Get('/profile')
  async getAdmin(@Req() req: any): Promise<Admin> {
    const admin = await this.adminService.getAdminById(req.user.userId);

    if (!admin) {
      throw new NotFoundException('Admin not found!!');
    }

    return admin;
  }

  @Post('/')
  async createAdmin(@Body() adminData: CreateAdminDto): Promise<Admin> {
    return await this.adminService.createAdmin(adminData);
  }
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Patch('/:id')
  async accept(
    @Param('id') doctorId: mongoose.Types.ObjectId,
    @Body('message') message: string,
    @Req() req: any,
  ) {
    // Check doctor is present or not
    const doctor = await this.doctorService.getDoctorById(doctorId);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (message) {
      await this.doctorService.addMessage(doctorId, {
        message,
        isApproved: 'cancelled',
      });
    } else {
      await this.doctorService.addMessage(doctorId, { isApproved: 'approved' });
    }
    return await this.adminService.removeDoctorId(req.user.userId, doctorId);
  }
}
