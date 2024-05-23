import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { DoctorService } from 'src/doctor/doctor.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './dto/signup.dto';
import { User } from 'src/user/schema/user.schema';
import { Doctor } from 'src/doctor/schema/doctor.schema';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginUserDto } from './dto/login.dto';
import { AdminService } from 'src/admin/admin.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private doctorService: DoctorService,
    private adminService: AdminService,
    private mailService: MailerService,
    private jwtService: JwtService,
  ) {}

  // Method for creation token
  async createToken(user: User | Doctor): Promise<string> {
    const payload = { email: user.email, role: user.role, userId: user._id };
    const token = await this.jwtService.signAsync(payload);

    return token;
  }

  // Method to handle user signup
  async signup(userData: CreateUserDto): Promise<User | Doctor> {
    const { password, passwordConfirm, role, email } = userData;

    if (password.trim() !== passwordConfirm.trim()) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    let user = null;

    // Check if the user already exists based on email and role
    if (role === 'patient') {
      user = await this.userService.getUser(email);
    } else if (role === 'doctor') {
      user = await this.doctorService.getDoctor(email);
    }

    // Create user based on role
    if (user) {
      throw new BadRequestException('User already exist');
    }

    if (role === 'patient') {
      user = await this.userService.createUser(userData);
    } else if (role === 'doctor') {
      user = await this.doctorService.createDoctor(userData);
    }

    if (!user) {
      throw new BadRequestException('User does not ceated');
    }

    const title = user.role === 'doctor' ? 'Dr.' : 'Mr./Ms.';
    await this.mailService.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to Life Link',
      text: `Welcome to Board ${title}${user.name}/n/n 
        Thank you for joing us!!`,
    });

    return user;
  }

  // Method to handle user login
  async login(loginData: LoginUserDto, res: Response): Promise<void> {
    const { email } = loginData;

    let user = null;

    // Retrieve user information (patient or doctor) based on email
    
    const patient = await this.userService.getUser(email, '+password');
    const doctor = await this.doctorService.getDoctor(email, '+password');

    if (patient) user = patient;
    if (doctor) user = doctor;

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    if (!(await await bcrypt.compare(loginData.password, user.password))) {
      throw new UnauthorizedException('Please enter valid email or password ');
    }

    // If authentication is successful, generate JWT token
    const payload = { email: user.email, role: user.role, userId: user._id };
    const token = await this.jwtService.signAsync(payload);

    res.set('Authorization', `Bearer ${token}`);

    // Send user data and token in response
    res.json({
      data: user,
      token,
    });
  }

  // Method to handle admin login
  async adminLogin(loginData: LoginUserDto, res: Response): Promise<void> {
    const { email } = loginData;

    const admin = await this.adminService.getAdmin(email, '+password');

    if (!admin) {
      throw new NotFoundException('Admin does not exist!');
    }

    if (!(await await bcrypt.compare(loginData.password, admin.password))) {
      throw new UnauthorizedException('Please enter valid email or password ');
    }

    // If authentication is successful, generate JWT token
    const payload = { email: admin.email, role: 'Admin', userId: admin._id };
    const token = await this.jwtService.signAsync(payload);

    res.set('Authorization', `Bearer ${token}`);

    // Send user data and token in response
    res.json({
      data: admin,
      token,
    });
  }

  // Method to send password reset token
  async forgotPassword(req: any): Promise<void> {
    const {
      user: { role, email },
    } = req;

    let user = null;

    if (role === 'doctor') {
      user = await this.doctorService.getDoctor(email, '+password');
    } else if (role === 'patient') {
      user = await this.userService.getUser(email, '+password');
    }

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save();

    console.log(resetToken);
    // 3) send it to user email
    const resetUrl = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/reset-password?token=${resetToken}}`;

    const message = `Forgot you password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\n If you didn't forgot your passord ,please ignore this email`;

    if (user) {
      this.mailService.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset',
        text: message,
      });
    }
  }

  // Method to password reset
  async resetPassword(
    token: string,
    passwordData: ResetPasswordDto,
  ): Promise<string> {
    const hashToken = crypto.createHash('sha256').update(token).digest('hex');

    let user = null;

    const doctor = await this.doctorService.getDoctorByToken(hashToken);
    const patient = await this.userService.getUserByToken(hashToken);

    if (doctor) user = doctor;
    if (patient) user = patient;

    if (!user) {
      throw new NotFoundException('Token get expired!!');
    }
    user.password = passwordData.newPassword;
    user.passwordConfirm = passwordData.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const newToken = await this.createToken(user);

    return newToken;
  }

  // Method for update password
  async updatePassword(
    @Req() req: any,
    passwordData: ForgotPasswordDto,
  ): Promise<string> {
    const {
      user: { role, email },
    } = req;
    let user = null;

    if (role === 'doctor') {
      user = await this.doctorService.getDoctor(email, '+password');
    } else if (role === 'patient') {
      user = await this.userService.getUser(email, '+password');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check that old password is match or not
    if (
      !(await user.correctPassword(passwordData.oldPassword, user.password))
    ) {
      throw new BadRequestException('Please enter a valid password');
    }

    // If so,updatepassword
    user.password = passwordData.newPassword;
    user.passwordConfirm = passwordData.confirmPassword;
    await user.save();

    const token = await this.createToken(user);

    return token;
  }
}
