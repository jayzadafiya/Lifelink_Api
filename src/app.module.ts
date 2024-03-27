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
    AuthModule,
    DoctorModule,
    UserModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MongoDBIdMiddleware).forRoutes(
      // { path: '/doctors/:doctorId/*', method: RequestMethod.ALL },
      { path: '*/:id/*', method: RequestMethod.ALL },
    );
  }
}
