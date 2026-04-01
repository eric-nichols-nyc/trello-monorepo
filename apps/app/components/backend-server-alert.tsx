"use client";

import { useEffect } from "react";

const SESSION_KEY = "backend-health-alert-shown";

type HealthJson = {
  ok?: boolean;
  error?: string;
};

/**
 * On load, checks `/api/backend-health` and shows a browser `alert` if the
 * Nest API is unreachable. Re-alerts in a new tab/session; clears the flag when
 * the API is healthy so the next outage notifies again.
 */
export function BackendServerAlert() {
  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/backend-health", { cache: "no-store" });
        const body = (await res.json()) as HealthJson;

        if (cancelled) {
          return;
        }

        if (body.ok) {
          try {
            sessionStorage.removeItem(SESSION_KEY);
          } catch {
            /* private mode / blocked storage */
          }
          return;
        }

        try {
          if (sessionStorage.getItem(SESSION_KEY)) {
            return;
          }
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* still show alert below */
        }

        window.alert(
          [
            "The API server is not reachable from the Next.js app.",
            "",
            body.error ?? `HTTP ${res.status}`,
            "",
            "Start the Nest API (e.g. pnpm dev in apps/api) and set API_URL in apps/app to that base URL.",
          ].join("\n"),
        );
      } catch {
        if (cancelled) {
          return;
        }
        window.alert(
          "Could not check API health (request failed). Is the Next.js dev server running?",
        );
      }
    }

    void check();

    const interval = window.setInterval(check, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
