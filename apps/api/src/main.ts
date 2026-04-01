import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express, { type NextFunction, type Request, type Response } from "express";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import { AppModule } from "./app.module";

const expressApp = express();

async function createApp() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    // Required for Clerk webhook signature verification (exact raw JSON bytes)
    rawBody: true,
  });

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: true,
    credentials: true,
  });
  // Basic security headers (helmet package install is blocked by workspace config)
  app.use((_: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()"
    );
    next();
  });

  // biome-ignore lint/correctness/useHookAtTopLevel: NestJS method, not a React hook
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  const { httpAdapter } = app.get(HttpAdapterHost);
  // biome-ignore lint/correctness/useHookAtTopLevel: NestJS method, not a React hook
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // Browsers probe `/` and `/favicon.ico`; routes live under `/api`, so handle these
  // here to avoid noisy 404s in logs.
  httpAdapter.get("/", (_req, res) => {
    res.redirect(302, "/api");
  });
  httpAdapter.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  await app.init();
  return app;
}

let bootstrapPromise: ReturnType<typeof createApp> | undefined;

function ensureApp() {
  if (!bootstrapPromise) {
    bootstrapPromise = createApp();
  }
  return bootstrapPromise;
}

/** Vercel Functions / Fluid Compute require a default export that handles the request. */
export default async function handler(req: Request, res: Response): Promise<void> {
  await ensureApp();
  expressApp(req, res);
}

async function listenLocally() {
  const app = await ensureApp();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

if (process.env.VERCEL !== "1") {
  void listenLocally();
}
