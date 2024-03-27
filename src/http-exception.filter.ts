import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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
    } else if (exception && typeof exception['message'] === 'string') {
      errorMessage = exception['message'];
    }

    console.log(exception);

    response.status(status).json({
      message: errorMessage,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
