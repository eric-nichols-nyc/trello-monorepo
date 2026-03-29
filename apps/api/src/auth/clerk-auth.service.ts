import { verifyToken } from "@clerk/backend";
import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

export type ClerkAuthPayload = {
  sub: string;
  sid?: string;
  [key: string]: unknown;
};

@Injectable()
export class ClerkAuthService {
  constructor(private readonly config: ConfigService) {}

  async verifyAndGetPayload(token: string): Promise<ClerkAuthPayload> {
    const secretKey = this.config.get<string>("CLERK_SECRET_KEY");
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY is not set");
    }

    // verifyToken (legacy return) returns the payload on success or throws TokenVerificationError on failure
    const authorizedParties = this.config.get("CLERK_AUTHORIZED_PARTIES")
      ? this.config
          .get("CLERK_AUTHORIZED_PARTIES")
          ?.split(",")
          .map((s: string) => s.trim())
      : undefined;

    const payload = await verifyToken(token, {
      secretKey,
      authorizedParties,
    });

    return payload as ClerkAuthPayload;
  }
}
