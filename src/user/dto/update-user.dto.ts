import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  bloodType?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}
