"use client";

import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

type AppErrorProperties = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

/**
 * Route-level error UI (Next.js `error.tsx`). Does not catch errors in the root `layout.tsx`;
 * see `global-error.tsx` for that.
 */
export default function AppError({ error, reset }: AppErrorProperties) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 overflow-auto bg-background px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="font-semibold text-2xl text-foreground">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. Try again, or return to your workspace.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <pre className="max-h-40 w-full overflow-auto rounded-md border border-border bg-muted p-3 text-left font-mono text-muted-foreground text-xs">
            {error.message}
          </pre>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={reset} type="button">
            Try again
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/w">Back to workspace</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
