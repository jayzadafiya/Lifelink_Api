import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SeparatedTimeSlots } from 'src/timeslot/timeslot.interface';

class TimeSlotDataDto {
  @IsNotEmpty()
  @IsString()
  slot: string;

  @IsNumber()
  appointments_time: number;

  @IsString()
  startingTime: string;

  @IsString()
  endingTime: string;
}

class ExperienceDto {
  @IsString()
  startingDate: string;

  @IsString()
  endingDate: string;

  @IsString()
  position: string;

  @IsString()
  place: string;
}

class QualificationDto {
  @IsString()
  startingDate: string;

  @IsString()
  endingDate: string;

  @IsString()
  degree: string;

  @IsString()
  university: string;
}

export class FormDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDataDto)
  timeSlots_data: TimeSlotDataDto[];

  @IsString()
  @IsOptional()
  bloodType?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences: ExperienceDto[];

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  qualifications: QualificationDto[];

  @IsNumber()
  @IsOptional()
  phone?: number;

  @IsNumber()
  @IsOptional()
  fees?: number;
}

export class UpdateDoctorDto {
  @ValidateNested({ each: true })
  @Type(() => FormDto)
  formData: FormDto;

  @IsOptional()
  timeSlots: SeparatedTimeSlots[];
}
