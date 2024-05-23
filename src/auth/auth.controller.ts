import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Doctor } from 'src/doctor/schema/doctor.schema';
import { User } from 'src/user/schema/user.schema';
import { CreateUserDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login.dto';
import { Response } from 'express';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { RolesGuard } from 'shared/role/role.gurd';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Endpoint for user signup
  @Post('/signup')
  async singup(@Body() createUserDto: CreateUserDto): Promise<User | Doctor> {
    return await this.authService.signup(createUserDto);
  }

  // Endpoint for user login
  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: Response,
  ): Promise<void> {
    return await this.authService.login(loginUserDto, res);
  }

  
  // Endpoint for admin login
  @Post('admin/login')
  async adminLogin(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: Response,
  ): Promise<void> {
    return await this.authService.adminLogin(loginUserDto, res);
  }

  // Endpoint for send reset token
  @UseGuards(RolesGuard)
  @Post('/forgot-password')
  async forgotPassword(@Req() req: any): Promise<void> {
    await this.authService.forgotPassword(req);
  }

  // Endpoint for reset password
  @Patch('/reset')
  async resetPassword(
    @Query('token') token: string,
    @Body() passwordData: ResetPasswordDto,
  ): Promise<string> {
    return await this.authService.resetPassword(token, passwordData);
  }

  // Endpoint for change Password
  @UseGuards(RolesGuard)
  @Patch('/update-password')
  async changePassword(
    @Req() req: any,
    @Body() passwordData: ForgotPasswordDto,
  ) {
    return await this.authService.updatePassword(req, passwordData);
  }
}
