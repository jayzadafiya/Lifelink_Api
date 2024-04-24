import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'utils/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(10)
  @Matches(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{4,}/,
    {
      message:
        'Password must contain at least one uppercase letter, one number, and one special character',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(10)
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{4,}$/,
    {
      message:
        'Confirm password must contain at least one uppercase letter, one number, and one special character ',
    },
  )
  passwordConfirm: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['male', 'female', 'other'])
  gender: string;
}
