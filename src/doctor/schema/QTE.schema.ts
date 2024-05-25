import { Prop, Schema } from '@nestjs/mongoose';

// Sub Schema for qualification property
@Schema()
export class Qualification {
  @Prop({ required: true })
  startingDate: string;

  @Prop()
  endingDate: string;

  @Prop({ required: true })
  degree: string;

  @Prop({ required: true })
  university: string;
}

// Sub Schema for experience property
@Schema()
export class Experience {
  @Prop({ required: true })
  startingDate: string;

  @Prop()
  endingDate: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  place: string;
}

// Sub Schema for timeslot property
@Schema()
export class Timeslot {
  @Prop({ required: true })
  slot: string;

  @Prop({ required: true })
  appointments_time: number;

  @Prop({ required: true })
  startingTime: string;

  @Prop({ required: true })
  endingTime: string;
}
