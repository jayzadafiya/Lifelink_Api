import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { DoctorModule } from 'src/doctor/doctor.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [DoctorModule, UserModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
