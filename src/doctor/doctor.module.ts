import { Module, forwardRef } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorSchema } from './schema/doctor.schema';
import { TimeslotModule } from 'src/timeslot/timeslot.module';
import { BookingModule } from 'src/booking/booking.module';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Doctor', schema: DoctorSchema }]),
    forwardRef(() => BookingModule),
    forwardRef(() => AdminModule),
    TimeslotModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
  exports: [DoctorService],
})
export class DoctorModule {}
