import { NextResponse } from "next/server";

const HEALTH_PATH = "/api/health";

/**
 * Same-origin probe for the browser: Next.js calls the Nest API using `API_URL`
 * (no CORS, no exposing the API host to the client).
 */
export async function GET() {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "API_URL is not set on the Next.js server (apps/app).",
      },
      { status: 503 },
    );
  }

  const url = `${baseUrl.replace(/\/$/, "")}${HEALTH_PATH}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Backend responded with ${response.status} (${url}).`,
        },
        { status: 502 },
      );
    }

    const payload: unknown = await response.json().catch(() => null);
    return NextResponse.json({ ok: true, backend: payload });
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : String(cause);
    return NextResponse.json(
      {
        ok: false,
        error: `Cannot reach API at ${url}: ${message}`,
      },
      { status: 503 },
    );
  }
}
