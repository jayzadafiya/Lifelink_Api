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
    AuthModule,
    DoctorModule,
    UserModule,
    ReviewModule,
    BookingModule,
    TimeslotModule,
    DonorModule,
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
