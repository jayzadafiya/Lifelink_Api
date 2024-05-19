import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  // @MinLength(4)
  // @MaxLength(10)
  // @Matches(
  //   /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{4,}/,
  //   {
  //     message:
  //       'Password must contain at least one uppercase letter, one number, and one special character',
  //   },
  // )
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  // @MinLength(4)
  // @MaxLength(10)
  // @Matches(
  //   /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{4,}/,
  //   {
  //     message:
  //       'Password must contain at least one uppercase letter, one number, and one special character',
  //   },
  // )
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  // @MinLength(4)
  // @MaxLength(10)
  // @Matches(
  //   /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{4,}/,
  //   {
  //     message:
  //       'Password must contain at least one uppercase letter, one number, and one special character',
  //   },
  // )
  confirmPassword: string;
}
