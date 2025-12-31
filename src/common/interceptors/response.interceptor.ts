import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from 'src/shared/types/api-response.type';

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        const response = context.switchToHttp().getResponse();

        return next.handle().pipe(
            map((data) => ({
                isSuccessful: true,
                responseStatus: '00',
                statusCode: response.statusCode.toString(),
                message: 'Request successful',
                error: '',
                data,
            })),
        );
    }
}
