import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { CLERK_AUTH_PAYLOAD } from "./clerk-auth.guard";
import type { ClerkAuthPayload } from "./clerk-auth.service";

export const CurrentUser = createParamDecorator(
  (data: keyof ClerkAuthPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const payload = request[CLERK_AUTH_PAYLOAD] as ClerkAuthPayload | undefined;

    if (!payload) {
      return;
    }

    if (data) {
      return payload[data];
    }

    return payload;
  }
);
