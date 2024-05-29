import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSchema } from './schema/admin.schema';
import { DoctorModule } from 'src/doctor/doctor.module';
import { UpdateDoctorModule } from 'src/update-doctor/update-doctor.module';
import { TimeslotModule } from 'src/timeslot/timeslot.module';
import { DonorModule } from 'src/donor/donor.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
    forwardRef(() => DoctorModule),
    forwardRef(() => UpdateDoctorModule),
    TimeslotModule,
    DonorModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
