import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { UserService } from './user.service';
import { User } from './schema/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'shared/role/role.gurd';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';
import { Request } from 'express';
import { BookingService } from 'src/booking/booking.service';
import { Booking } from 'src/booking/schema/booking.schema';

@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private bookingService: BookingService,
  ) {}

  //Endpoint for get current user profile
  @Roles(Role.Patient)
  @Get('/profile')
  async getMe(@Req() req: any): Promise<User> {
    return this.userService.getUserById(
      new mongoose.Types.ObjectId(req.user.userId),
    );
  }

  //Endpoint for get appointments for the current user
  @Roles(Role.Patient)
  @Get('/my-appointments')
  async getMyAppointment(
    @Req() req: Request | any,
  ): Promise<{ upcoming: Booking[]; history: Booking[] }> {
    const user = await this.userService.getUserById(req.user.userId);

    if (!user) {
      throw new BadRequestException('User Dose not Exists');
    }
    return this.bookingService.getAppointment(
      'user',
      new mongoose.Types.ObjectId(req.user.userId),
    );
  }

  //Endpoint for get user by ID
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

  // Endpoint for get all users (only for admin)
  @Roles(Role.Admin)
  @Get('/')
  async getAllUser(): Promise<User[]> {
    return this.userService.getAllUser();
  }

  // Endpoint for update user details
  @Roles(Role.Patient)
  @Put('/:id')
  async updateUser(
    @Req() req: any,
    @Body() updateData: UpdateUserDto,
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<User> {
    if (req.user.userId !== id) {
      throw new UnauthorizedException(
        "You don't have access to delete this user",
      );
    }

    return this.userService.updateUser(updateData, id);
  }

  // Endpoint for delete user (only for admin)
  @Roles(Role.Patient, Role.Admin)
  @Patch('/:id')
  async deleteUser(
    @Req() req: any,
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<void> {
    if (req.user.role === 'admin') {
      const user = await this.userService.getUserById(id);

      if (user) {
        throw new BadRequestException('Please provide valid ID');
      }
    }

    if (req.user.role === 'owner') {
      if (req.user.userId !== id) {
        throw new UnauthorizedException(
          "You don't have access to delete this user",
        );
      }
    }
    await this.userService.deleteUser(id);
  }
}
