import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse } from 'src/shared/types/api-response.type';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'ServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res?.message || message;
      error = res?.error || error;
    }

    const apiResponse: ApiResponse = {
      isSuccessful: false,
      responseStatus: '99',
      statusCode: status.toString(),
      message,
      error,
    };

    response.status(status).json(apiResponse);
  }
}
