import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseObj = exception.getResponse();
      if (typeof responseObj === 'string') {
        errorMessage = responseObj;
      } else if (
        typeof responseObj === 'object' &&
        responseObj.hasOwnProperty('message')
      ) {
        errorMessage = responseObj['message'];
      }
    } else if ((exception as any).name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      errorMessage = 'Invalid ID format';
    } else if ((exception as any).name === 'BSONError') {
      status = HttpStatus.BAD_REQUEST;
      errorMessage = 'Invalid ID format';
    } else if (exception instanceof TypeError) {
      status = HttpStatus.BAD_REQUEST;
      errorMessage = exception.message;
    } else if (exception instanceof Stripe.errors.StripeError) {
      status = HttpStatus.BAD_REQUEST;
      errorMessage = 'Stripe error occurred';
    } else if (exception && typeof exception['message'] === 'string') {
      errorMessage = exception['message'];
    }

    response.status(status).json({
      message: errorMessage,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
