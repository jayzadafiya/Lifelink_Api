import { Controller, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { RolesGuard } from 'shared/role/role.gurd';

@UseGuards(RolesGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}
}
