import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DoctorService } from 'src/doctor/doctor.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './dto/signup.dto';
import { User } from 'src/user/schema/user.schema';
import { Doctor } from 'src/doctor/schema/doctor.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private doctorService: DoctorService,
    private jwtService: JwtService,
  ) {}

  async signup(userData: CreateUserDto): Promise<User | Doctor> {
    const { password, passwordConfirm, role, email } = userData;

    if (password.trim() !== passwordConfirm.trim()) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    let user = null;

    if (role === 'patient') {
      user = await this.userService.getUser(email);
    }

    if (role === 'doctor') {
      user = await this.doctorService.getDoctor(email);
    }

    if (user) {
      throw new BadRequestException('User already exist');
    }

    if (role === 'patient') {
      user = this.userService.createUser(userData);
    }

    if (role === 'doctor') {
      user = this.doctorService.createDoctor(userData);
    }

    if (!user) {
      throw new BadRequestException('User does not ceated');
    }

    return user;
  }

  async login(loginData: LoginUserDto, res: Response): Promise<void> {
    const { email } = loginData;
    console.log(loginData);

    let user = null;
    const patient = await this.userService.getUser(email, '+password');
    const doctor = await this.doctorService.getDoctor(email, '+password');

    if (patient) user = patient;
    if (doctor) user = doctor;

    if (
      !user ||
      !(await await bcrypt.compare(loginData.password, user.password))
    ) {
      throw new UnauthorizedException('Please enter valid email or password ');
    }
    const payload = { email: user.email, role: user.role, userId: user._id };

    const token = await this.jwtService.signAsync(payload);

    res.set('Authorization', `Bearer ${token}`);

    res.json({
      role: payload.role,
      data: user,
      token,
    });
  }
}
