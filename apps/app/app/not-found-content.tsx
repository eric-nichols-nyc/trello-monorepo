import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";

/** Shared 404 body (with or without {@link GlobalHeader} from the parent layout). */
export function NotFoundContent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <p className="font-medium text-muted-foreground text-sm">404</p>
        <h1 className="font-semibold text-2xl text-foreground">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm">
          That URL doesn’t match a page in this app. Check the address or head
          back to your workspace.
        </p>
        <Button asChild type="button">
          <Link href="/w">Back to workspace</Link>
        </Button>
      </div>
    </div>
  );
}
