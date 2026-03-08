import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { ClerkAuthPayload } from "./clerk-auth.service";
import { CLERK_AUTH_PAYLOAD } from "./clerk-auth.guard";

export const CurrentUser = createParamDecorator(
  (data: keyof ClerkAuthPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const payload = request[CLERK_AUTH_PAYLOAD] as ClerkAuthPayload | undefined;

    if (!payload) {
      return undefined;
    }

    if (data) {
      return payload[data];
    }

    return payload;
  },
);
