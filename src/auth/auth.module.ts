import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { DoctorModule } from 'src/doctor/doctor.module';
import { AdminModule } from 'src/admin/admin.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [UserModule, DoctorModule, AdminModule, SocketModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
