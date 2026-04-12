import { Loader2 } from "lucide-react";

type CardBackRouteSkeletonProps = {
  /**
   * `modal`: dimmed overlay while the intercepted dialog’s route loads.
   * `page`: centered in the main column for direct `/c/:id` navigation.
   */
  variant?: "modal" | "page";
};

/**
 * Shown from route {@link loading.tsx} while `loadCardRoute` runs.
 */
export function CardBackRouteSkeleton({
  variant = "modal",
}: CardBackRouteSkeletonProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-2" role="status">
      <Loader2
        aria-hidden
        className="size-8 shrink-0 animate-spin text-zinc-400"
      />
      <span className="sr-only">Loading card</span>
    </div>
  );

  if (variant === "page") {
    return (
      <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center bg-background">
        {spinner}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {spinner}
    </div>
  );
}
