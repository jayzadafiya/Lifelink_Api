import { Module, forwardRef } from '@nestjs/common';
import { UpdateDoctorService } from './update-doctor.service';
import { UpdateDoctorController } from './update-doctor.controller';
import { UpdateDoctorSchema } from './schema/updateDoctor.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UpdateDoctor', schema: UpdateDoctorSchema },
    ]),

    forwardRef(() => AdminModule),
  ],
  providers: [UpdateDoctorService],
  controllers: [UpdateDoctorController],
  exports: [UpdateDoctorService],
})
export class UpdateDoctorModule {}