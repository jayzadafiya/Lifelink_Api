import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class Medicine {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  dailyTime: string;

  @IsNotEmpty()
  @IsString()
  mealTime: string;

  @IsNotEmpty()
  @IsNumber()
  totalMedicine: number;
}

export class createPrescriptionDto {
  @IsOptional()
  @IsArray()
  symptoms: string[];

  @IsOptional()
  @IsArray()
  advice: string[];

  @IsOptional()
  @IsArray()
  test: string[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Medicine)
  medicine: Medicine[];
}
