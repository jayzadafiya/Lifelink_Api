import mongoose from 'mongoose';
import {
  Body,
  Controller,
  Param,
  Put,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'utils/role.enum';
import { Roles } from 'shared/role/role.decorator';
import { RolesGuard } from 'shared/role/role.gurd';
import { UpdateDoctorDto } from 'src/doctor/dto/updateDoctor.dto';
import { UpdateDoctorService } from './update-doctor.service';
import { AdminService } from 'src/admin/admin.service';
import { UpdateDoctor, UpdateTimeslot } from './schema/updateDoctor.schema';

@Controller('update-doctor')
export class UpdateDoctorController {
  constructor(
    private updateDoctorService: UpdateDoctorService,
    private adminService: AdminService,
  ) {}

  // Endpoint for get doctor by id
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Get('/:id')
  async getDoctor(
    @Param('id') doctorId: mongoose.Types.ObjectId,
  ): Promise<UpdateDoctor> {
    return await this.updateDoctorService.getDoctorById(doctorId);
  }

  // Endpoint for update doctor
  @UseGuards(RolesGuard)
  @Roles(Role.Doctor)
  @Put('/:id')
  async updateDoctor(
    @Req() req: any,
    @Body() updateData: UpdateDoctorDto,
    @Param('id') doctorId: mongoose.Types.ObjectId,
  ): Promise<void> {
    if (req.user.userId !== doctorId) {
      throw new UnauthorizedException(
        "You don't have access to update this user",
      );
    }

    const { formData, timeSlots } = updateData;
    // console.log(timeSlots); //[{morninig:["7:00","7:10"]}]

    const timeslotArray: UpdateTimeslot[] = []; //{slotName:"morining",times:["7:00","7:10"]}
    if (timeSlots) {
      for (const slot of timeSlots) {
        const slotName = Object.keys(slot)[0];
        const times = slot[slotName];

        timeslotArray.push({ slotName, times });
      }
    }

    const acknowledged = await this.updateDoctorService.upsertDummyupdateDoctor(
      doctorId,
      { formData, timeslots: timeslotArray },
    );
    if (acknowledged) {
      await this.adminService.addDoctorRequest(doctorId);
    }
  }
}
