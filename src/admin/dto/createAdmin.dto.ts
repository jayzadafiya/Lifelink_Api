import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ArrayUnique,
  IsEnum,
} from 'class-validator';
import { Role } from 'utils/role.enum';

export class CreateAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  passwordConfirm?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  doctors?: string[];
}
