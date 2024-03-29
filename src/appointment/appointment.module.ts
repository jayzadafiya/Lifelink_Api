import { Module, forwardRef } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentgSchema } from './schema/appointment.schema';
import { DoctorModule } from 'src/doctor/doctor.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Appointment', schema: AppointmentgSchema },
    ]),
    forwardRef(() => DoctorModule),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
