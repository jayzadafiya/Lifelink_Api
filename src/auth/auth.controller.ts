import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Doctor } from 'src/doctor/schema/doctor.schema';
import { User } from 'src/user/schema/user.schema';
import { CreateUserDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async singup(@Body() createUserDto: CreateUserDto): Promise<User | Doctor> {
    return this.authService.signup(createUserDto);
  }

  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: Response,
  ): Promise<void> {
    return await this.authService.login(loginUserDto, res);
  }
}
