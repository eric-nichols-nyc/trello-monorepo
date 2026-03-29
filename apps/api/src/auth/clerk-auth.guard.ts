import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
// biome-ignore lint/style/useImportType: Nest DI needs class references for ClerkAuthGuard
import { UsersService } from "../users/users.service";
// biome-ignore lint/style/useImportType: Nest DI needs class references for ClerkAuthGuard
import { ClerkAuthService } from "./clerk-auth.service";

export const CLERK_AUTH_PAYLOAD = "clerkAuthPayload";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly clerkAuthService: ClerkAuthService,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      throw new UnauthorizedException(
        "Missing or invalid Authorization header"
      );
    }

    try {
      const payload = await this.clerkAuthService.verifyAndGetPayload(token);
      await this.usersService.ensureUserAndDefaultWorkspace(payload);
      (request as Request & { [CLERK_AUTH_PAYLOAD]: typeof payload })[
        CLERK_AUTH_PAYLOAD
      ] = payload;
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid or expired token";
      throw new UnauthorizedException(message);
    }
  }
}
