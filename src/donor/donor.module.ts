import { Module } from '@nestjs/common';
import { DonorController } from './donor.controller';
import { DonorService } from './donor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DonorSchema } from './schema/donor.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Donor', schema: DonorSchema }]),
    HttpModule.register({}),
  ],
  controllers: [DonorController],
  providers: [DonorService],
  exports: [DonorService],
})
export class DonorModule {}
