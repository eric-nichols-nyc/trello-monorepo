import type { UserJSON } from "@clerk/backend";
import { verifyWebhook, type WebhookEvent } from "@clerk/backend/webhooks";
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
import type { Request as ExpressRequest } from "express";
// biome-ignore lint/style/useImportType: Nest DI needs ClerkWebhooksService for constructor injection
import { ClerkWebhooksService } from "./webhooks.service";

/** True when `value` looks like Clerk’s `User` JSON (`object: "user"` + string `id`). */
function isUserJSON(value: unknown): value is UserJSON {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as { object?: unknown; id?: unknown };
  return o.object === "user" && typeof o.id === "string";
}

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

/** For `user.deleted`, `data.id` is the Clerk user id to remove from our DB. */
function getClerkUserIdForUserDeleted(evt: WebhookEvent): string | null {
  if (evt.type !== "user.deleted") {
    return null;
  }
  const data = evt.data;
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const id = (data as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
}

/** Build a Web `Request` for Clerk's `verifyWebhook` from Express + raw body. */
function buildClerkWebhookRequestFromExpress(
  req: ExpressRequest,
  rawBody: Buffer
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

/**
 * Clerk → Svix-signed HTTP webhooks. Configure in Clerk Dashboard to `POST` this app’s
 * `/webhooks/clerk` URL with the same signing secret as `CLERK_WEBHOOK_SECRET` (or
 * `CLERK_WEBHOOK_SIGNING_SECRET`).
 *
 * **Handled event types**
 * - `user.deleted` — delete local `User` by `clerkUserId` (cascades per Prisma).
 * - `user.created` / `user.updated` / `session.created` (with `data.user`) — upsert `User`
 *   and create default workspace if none exists (`ClerkWebhooksService.ensureUserAndDefaultWorkspace`).
 *
 * Other event types verify successfully but do not sync; response includes `synced: false`.
 */
@Controller("webhooks")
export class ClerkWebhooksController {
  private readonly logger = new Logger(ClerkWebhooksController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly clerkWebhooksService: ClerkWebhooksService
  ) {}

  /**
   * Entry point for all Clerk webhook deliveries to this API.
   * Requires the **raw** JSON body (byte-for-byte) for signature verification.
   */
  @Post("clerk")
  async handleClerkWebhook(
    @Req() req: ExpressRequest,
    @RawBody() rawBody: Buffer | undefined
  ) {
    // --- Signing secret (Clerk Dashboard → Webhooks → signing secret) ---
    const secret =
      this.config.get<string>("CLERK_WEBHOOK_SECRET") ??
      this.config.get<string>("CLERK_WEBHOOK_SIGNING_SECRET");

    if (!secret) {
      throw new InternalServerErrorException(
        "Set CLERK_WEBHOOK_SECRET or CLERK_WEBHOOK_SIGNING_SECRET (from Clerk → Webhooks → Signing secret)."
      );
    }

    // --- Raw body: must match what Clerk signed (see `main.ts` rawBody: true) ---
    if (!rawBody?.length) {
      throw new InternalServerErrorException(
        "Missing raw body. Ensure NestFactory.create(..., { rawBody: true }) in main.ts."
      );
    }

    const incomingRequest = buildClerkWebhookRequestFromExpress(req, rawBody);

    // --- Verify Svix signature and parse `evt.type` + `evt.data` ---
    let evt: WebhookEvent;
    try {
      evt = await verifyWebhook(incomingRequest, { signingSecret: secret });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Webhook verification failed";
      throw new BadRequestException(msg);
    }

    // --- Branch: account removed in Clerk ---
    const deletedClerkUserId = getClerkUserIdForUserDeleted(evt);
    if (deletedClerkUserId) {
      const { count } =
        await this.clerkWebhooksService.deleteUserByClerkId(deletedClerkUserId);
      this.logger.log(
        `user.deleted: removed ${count} DB row(s) for clerkUserId=${deletedClerkUserId}`
      );
      return {
        ok: true,
        type: evt.type,
        deleted: count,
      };
    }

    // --- Branch: upsert app user + default workspace from Clerk user JSON ---
    const userPayload = getUserPayloadForSync(evt);
    if (userPayload && isUserJSON(userPayload)) {
      await this.clerkWebhooksService.ensureUserAndDefaultWorkspace(
        userPayload
      );
      this.logger.log(
        `Synced user + default workspace from webhook type=${evt.type}`
      );
      return {
        ok: true,
        type: evt.type,
        synced: true,
      };
    }

    // --- Verified event we do not map to DB actions (e.g. `organizationMembership.*`) ---
    this.logger.warn(
      `Webhook ok but no user sync for type=${evt.type}. ` +
        `Use Testing → event "user.created", or subscribe to user.created / session.created / user.deleted in the endpoint.`
    );
    return {
      ok: true,
      type: evt.type,
      synced: false,
      hint: "Handled: user.created, user.updated, session.created (with data.user), user.deleted. Other types are ignored.",
    };
  }
}
