import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'shared/role/role.gurd';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';
import mongoose from 'mongoose';
import { Request } from 'express';
import { DoctorService } from 'src/doctor/doctor.service';
import { BookingService } from 'src/booking/booking.service';
import { Booking } from 'src/booking/schema/booking.schema';

@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private doctorService: DoctorService,
    private bookingService: BookingService,
  ) {}

  @Roles(Role.Patient)
  @Get('/profile')
  async getMe(@Req() req: any): Promise<User> {
    return this.userService.getUserById(
      new mongoose.Types.ObjectId(req.user.userId),
    );
  }

  @Roles(Role.Patient)
  @Get('/my-appointments')
  async getMyAppointment(@Req() req: Request | any): Promise<Booking[]> {
    const bookingData = await this.bookingService.getAppointmentUserId(
      req.user.userId,
    );

    return bookingData;
  }

  @Roles(Role.Patient, Role.Admin)
  @Get('/:id')
  async getUser(
    @Param('id') id: mongoose.Types.ObjectId,
    @Req() req: Request | any,
  ): Promise<User> {
    if (req.user.role === 'patient' && req.user.userId !== id.toString()) {
      throw new UnauthorizedException(
        'You can only access your own information.',
      );
    }

    return this.userService.getUserById(id);
  }

  @Roles(Role.Admin)
  @Get('/')
  async getAllUser(): Promise<User[]> {
    return this.userService.getAllUser();
  }

  @Roles(Role.Patient)
  @Put('/:id')
  async updateUser(
    @Body() updateData: UpdateUserDto,
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<User> {
    return this.userService.updateUser(updateData, id);
  }

  @Roles(Role.Patient)
  @Delete('/:id')
  async dleeteUser(@Param('id') id: mongoose.Types.ObjectId): Promise<string> {
    return this.userService.deleteUser(id);
  }
}
