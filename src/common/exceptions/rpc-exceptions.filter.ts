import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcExceptionsFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    // Handle RPC exceptions
    throw exception;
  }
}
