import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskServiceService } from './task-service.service';
import { BookingModule } from 'src/booking/booking.module';
import { DoctorModule } from 'src/doctor/doctor.module';

@Module({
  imports: [ScheduleModule.forRoot(), BookingModule, DoctorModule],
  providers: [TaskServiceService],
})
export class TaskServiceModule {}
