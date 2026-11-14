import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

export interface ApiErrorResponse {
  success: false;
  error: string | string[];
  statusCode: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const isHttp = exception instanceof HttpException;
    if (!isHttp) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const reply = host.switchToHttp().getResponse<{
      status: (code: number) => { send: (body: ApiErrorResponse) => void };
    }>();

    const statusCode = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let error: string | string[] = 'Internal server error';
    if (isHttp) {
      const res = exception.getResponse();
      error =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message ??
            exception.message);
    }

    reply.status(statusCode).send({ success: false, error, statusCode });
  }
}
