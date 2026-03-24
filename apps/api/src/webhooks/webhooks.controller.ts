import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
  RawBody,
  Req,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs ConfigService for constructor injection
import { ConfigService } from "@nestjs/config";
import {
  type WebhookEvent,
  verifyWebhook,
} from "@clerk/backend/webhooks";
import type { Request as ExpressRequest } from "express";
// biome-ignore lint/style/useImportType: Nest DI needs ClerkWebhooksService for constructor injection
import { ClerkWebhooksService } from "./webhooks.service";

/**
 * Resolve a Clerk User object from a verified webhook when we can sync to DB.
 * - user.created / user.updated → data is the user
 * - session.created → data.user when present (sign-in flow; Testing tab often sends this)
 */
function getUserPayloadForSync(evt: WebhookEvent): unknown | null {
  if (evt.type === "user.created" || evt.type === "user.updated") {
    return evt.data;
  }
  if (evt.type === "session.created") {
    const d = evt.data;
    if (d && typeof d === "object" && "user" in d) {
      const u = (d as { user?: unknown }).user;
      if (u) {
        return u;
      }
    }
  }
  return null;
}

/** Build a Web `Request` for Clerk's `verifyWebhook` from Express + raw body. */
function buildClerkWebhookRequestFromExpress(
  req: ExpressRequest,
  rawBody: Buffer,
): globalThis.Request {
  const host = req.get("x-forwarded-host") ?? req.get("host") ?? "localhost";
  const proto = req.get("x-forwarded-proto") ?? req.protocol ?? "https";
  const url = `${proto}://${host}${req.originalUrl}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  return new globalThis.Request(url, {
    method: "POST",
    headers,
    body: rawBody,
  });
}

@Controller("webhooks")
export class ClerkWebhooksController {
  private readonly logger = new Logger(ClerkWebhooksController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly clerkWebhooksService: ClerkWebhooksService,
  ) {}

  @Post("clerk")
  async handleClerkWebhook(
    @Req() req: ExpressRequest,
    @RawBody() rawBody: Buffer | undefined,
  ) {
    const secret =
      this.config.get<string>("CLERK_WEBHOOK_SECRET") ??
      this.config.get<string>("CLERK_WEBHOOK_SIGNING_SECRET");

    if (!secret) {
      throw new InternalServerErrorException(
        "Set CLERK_WEBHOOK_SECRET or CLERK_WEBHOOK_SIGNING_SECRET (from Clerk → Webhooks → Signing secret).",
      );
    }

    if (!rawBody?.length) {
      throw new InternalServerErrorException(
        "Missing raw body. Ensure NestFactory.create(..., { rawBody: true }) in main.ts.",
      );
    }

    const incomingRequest = buildClerkWebhookRequestFromExpress(req, rawBody);

    let evt: WebhookEvent;
    try {
      evt = await verifyWebhook(incomingRequest, { signingSecret: secret });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Webhook verification failed";
      throw new BadRequestException(msg);
    }

    const userPayload = getUserPayloadForSync(evt);
    if (userPayload) {
      await this.clerkWebhooksService.ensureUserAndDefaultWorkspace(userPayload);
      this.logger.log(
        `Synced user + default workspace from webhook type=${evt.type}`,
      );
      return {
        ok: true,
        type: evt.type,
        synced: true,
      };
    }

    this.logger.warn(
      `Webhook ok but no user sync for type=${evt.type}. ` +
        `Use Testing → event "user.created", or subscribe to user.created / session.created in the endpoint.`,
    );
    return {
      ok: true,
      type: evt.type,
      synced: false,
      hint:
        "Only user.created, user.updated (user payload), and session.created (with data.user) create rows.",
    };
  }
}
