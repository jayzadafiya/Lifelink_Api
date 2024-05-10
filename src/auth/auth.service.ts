import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DoctorService } from 'src/doctor/doctor.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './dto/signup.dto';
import { User } from 'src/user/schema/user.schema';
import { Doctor } from 'src/doctor/schema/doctor.schema';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private doctorService: DoctorService,
    private jwtService: JwtService,
  ) {}

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
      user = this.userService.createUser(userData);
    } else if (role === 'doctor') {
      user = this.doctorService.createDoctor(userData);
    }

    if (!user) {
      throw new BadRequestException('User does not ceated');
    }

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
}
