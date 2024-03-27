import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { Doctor } from './schema/doctor.schema';
import { RolesGuard } from 'src/role/role.gurd';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'utils/role.enum';
import mongoose from 'mongoose';

@Controller('doctors')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @Get('/:id')
  async getUser(@Param('id') id: mongoose.Types.ObjectId): Promise<Doctor> {
    return this.doctorService.getDoctorById(id);
  }

  @Get('/')
  async getAllDoctor(@Query('query') query?: string): Promise<Doctor[]> {
    return this.doctorService.getAllDoctor(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Doctor)
  @Put('/:id')
  async updateDoctor(
    @Body() updateData: UpdateUserDto,
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<Doctor> {
    return this.doctorService.updateDoctor(id, updateData);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Doctor)
  @Delete('/:id')
  async dleeteDoctor(
    @Param('id') id: mongoose.Types.ObjectId,
  ): Promise<string> {
    return this.doctorService.deleteDoctor(id);
  }
}
