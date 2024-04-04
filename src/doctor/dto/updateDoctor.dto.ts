import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class TimeSlotDto {
  @IsString()
  day: string;

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

export class UpdateDoctorDto {
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
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[];

  @IsString()
  @IsOptional()
  bloodType?: string;

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
