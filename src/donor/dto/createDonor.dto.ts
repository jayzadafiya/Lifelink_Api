import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  Length,
  IsNumber,
} from 'class-validator';

export class CreateDonorDto {
  @IsNotEmpty()
  @IsString()
  dob: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsNumber()
  phone: number;

  @IsNotEmpty()
  @IsString()
  weight: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(['male', 'female', 'other'])
  gender: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  surgery?: string;

  @IsOptional()
  @IsString()
  disease?: string;

  @IsOptional()
  @IsString()
  styling?: string;

  @IsNotEmpty()
  @IsString()
  bloodType: string;

  @IsNotEmpty()
  @IsString()
  @Length(12)
  addharCard: string;

  @IsOptional()
  @IsString()
  lastDonationDate?: string;
}
