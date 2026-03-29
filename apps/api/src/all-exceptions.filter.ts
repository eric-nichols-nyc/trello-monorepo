import {
  type ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";

type MyResponseObj = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const myResponseObj: MyResponseObj = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: "",
    };

    // Add more Prisma Error Types if you want
    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.response = exception.getResponse();
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      const validationError: Prisma.PrismaClientValidationError = exception;
      myResponseObj.statusCode = 422;
      myResponseObj.response = validationError.message.replaceAll(/\n/g, " ");
    } else {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.response = "Internal Server Error";
    }

    response.status(myResponseObj.statusCode).json(myResponseObj);

    const errMsg =
      typeof myResponseObj.response === "string"
        ? myResponseObj.response
        : JSON.stringify(myResponseObj.response);
    this.logger.error(errMsg);

    super.catch(exception, host);
  }
}
