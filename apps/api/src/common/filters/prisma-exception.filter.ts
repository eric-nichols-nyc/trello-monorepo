import {
  Catch,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";
import { Prisma } from "../../../generated/prisma/client";

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientInitializationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const { statusCode, message } = this.mapKnownError(exception);
      return res.status(statusCode).json({
        statusCode,
        message,
      });
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid database query input",
      });
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      const message =
        exception instanceof Error ? exception.message : "Unknown database init error";
      this.logger.error(`Prisma initialization failed: ${message}`);
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: "Database connection unavailable",
      });
    }
  }

  private mapKnownError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
  } {
    switch (error.code) {
      case "P2025":
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: "Resource not found",
        };
      case "P2002":
        return {
          statusCode: HttpStatus.CONFLICT,
          message: "Unique constraint violation",
        };
      case "P2003":
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Invalid relation reference",
        };
      default:
        this.logger.error(
          `Unhandled Prisma error code ${error.code}: ${error.message}`,
        );
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Database operation failed",
        };
    }
  }
}
