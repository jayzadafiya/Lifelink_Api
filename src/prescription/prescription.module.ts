import { Module } from '@nestjs/common';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PrescriptionSchema } from './schema/prescription.schema';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Prescription', schema: PrescriptionSchema },
    ]),
    BookingModule,
  ],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
})
export class PrescriptionModule {}
