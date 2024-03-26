import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'utils/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}
