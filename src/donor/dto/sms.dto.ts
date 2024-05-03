import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class SMSDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(10)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(10)
  donorPhone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  message?: string;
}
