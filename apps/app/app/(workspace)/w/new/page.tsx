import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";

export default function NewBoardPage() {
  return (
    <div className="mx-auto max-w-[914px] space-y-4">
      <h1 className="font-semibold text-2xl text-foreground">New board</h1>
      <p className="text-muted-foreground text-sm">
        Board creation is not wired up in the UI yet. Use the API or seed data
        for now.
      </p>
      <Button asChild variant="outline">
        <Link href="/w">Back to workspace</Link>
      </Button>
    </div>
  );
}
