import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { AuthService } from './auth.service';
import { Doctor } from 'src/doctor/schema/doctor.schema';
import { User } from 'src/user/schema/user.schema';
import { CreateUserDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { RolesGuard } from 'shared/role/role.gurd';
import { AuthRequest } from 'shared/request.interface';
import { Roles } from 'shared/role/role.decorator';
import { Role } from 'utils/role.enum';
import { Admin } from 'src/admin/schema/admin.schema';

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
  ): Promise<{ data: User | Admin; token: string }> {
    return await this.authService.login(loginUserDto);
  }

  // Endpoint for admin login
  @Post('/admin-login')
  async adminLogin(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ data: Admin; token: string }> {
    return await this.authService.adminLogin(loginUserDto);
  }

  // Endpoint for admin logout
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @Post('/:adminId/admin-logout')
  async logout(
    @Param('adminId') adminId: mongoose.Types.ObjectId,
  ): Promise<void> {
    await this.authService.adminLogout(adminId);
  }

  // Endpoint for send reset token
  @UseGuards(RolesGuard)
  @Post('/forgot-password')
  async forgotPassword(@Req() req: AuthRequest): Promise<void> {
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
    @Req() req: AuthRequest,
    @Body() passwordData: ForgotPasswordDto,
  ): Promise<string> {
    return await this.authService.updatePassword(req, passwordData);
  }
}
