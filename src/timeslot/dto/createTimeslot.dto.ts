import { IsString, IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateTimeslotsDto {
  @IsNotEmpty()
  @IsString()
  time: string;

  @IsNotEmpty()
  @IsMongoId()
  doctor: string;

  @IsArray()
  @IsString({ each: true })
  bookingDate: string[];
}
