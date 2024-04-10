import { Module } from '@nestjs/common';
import { TimeslotController } from './timeslot.controller';
import { TimeslotService } from './timeslot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeslotsSchema } from './schema/timeslot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Timeslots', schema: TimeslotsSchema }]),
  ],
  controllers: [TimeslotController],
  providers: [TimeslotService],
  exports: [TimeslotService],
})
export class TimeslotModule {}
