import { IsNotEmpty, IsString } from 'class-validator';

export class BookingDto {
  @IsNotEmpty()
  @IsString()
  bookingDate: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsNotEmpty()
  @IsString()
  slotPhase: string;
}
