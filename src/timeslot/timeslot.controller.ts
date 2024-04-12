import { Body, Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { TimeslotService } from './timeslot.service';
import { RolesGuard } from 'shared/role/role.gurd';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';
import mongoose from 'mongoose';

@UseGuards(RolesGuard)
@Controller('timeslot')
export class TimeslotController {
  constructor(private timeService: TimeslotService) {}

  @Roles(Role.Doctor)
  @Delete('/:id')
  async deleteTimeslot(
    @Param('id') docterId: mongoose.Types.ObjectId,
    @Body('slotPhase') slotPhase: string,
  ) {
   await  this.timeService.deleteTimeslots(docterId, slotPhase);
  }
}
