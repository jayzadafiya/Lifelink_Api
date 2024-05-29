import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ReviewModule } from './review/review.module';
import { MongoDBIdMiddleware } from 'shared/mongodb-id.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
import { BookingModule } from './booking/booking.module';
import { TimeslotModule } from './timeslot/timeslot.module';
import { DonorModule } from './donor/donor.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { AdminModule } from './admin/admin.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { TaskServiceModule } from './task-service/task-service.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UpdateDoctorModule } from './update-doctor/update-doctor.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRESIN },
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.TIME_TO_LIVE),
        limit: parseInt(process.env.LIMIT),
      },
    ]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: process.env.EMAIL_HOST,
        port: +process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    AuthModule,
    DoctorModule,
    UserModule,
    ReviewModule,
    BookingModule,
    TimeslotModule,
    DonorModule,
    PrescriptionModule,
    AdminModule,
    TaskServiceModule,
    CloudinaryModule,
    UpdateDoctorModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MongoDBIdMiddleware)
      .forRoutes({ path: '*/:id/*', method: RequestMethod.ALL });
  }
}
