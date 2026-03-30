"use client";

import { fonts } from "@repo/design-system/lib/fonts";
import { useEffect } from "react";

import "./styles.css";

type GlobalErrorProperties = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

/**
 * Root-level error UI when the root `layout` fails. Must define `html` / `body` and stay
 * independent of `layout.tsx` (no providers from the root layout run here).
 */
export default function GlobalError({ error, reset }: GlobalErrorProperties) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html className={fonts} lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 overflow-auto px-6 py-12">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
            <h1 className="font-semibold text-2xl text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground text-sm">
              The app could not load correctly. Try again or open your workspace
              in a new visit.
            </p>
            {process.env.NODE_ENV === "development" ? (
              <pre className="max-h-40 w-full overflow-auto rounded-md border border-border bg-muted p-3 text-left font-mono text-muted-foreground text-xs">
                {error.message}
              </pre>
            ) : null}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onClick={reset}
                type="button"
              >
                Try again
              </button>
              <a
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                href="/w"
              >
                Back to workspace
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
