import { Module, forwardRef } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { DoctorModule } from 'src/doctor/doctor.module';
import { UserModule } from 'src/user/user.module';
import { TimeslotModule } from 'src/timeslot/timeslot.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingSchema } from './schema/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Booking', schema: BookingSchema }]),
    forwardRef(() => DoctorModule),
    forwardRef(() => UserModule),
    TimeslotModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
