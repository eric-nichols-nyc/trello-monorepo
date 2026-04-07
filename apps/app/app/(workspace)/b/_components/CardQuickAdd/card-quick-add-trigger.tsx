import { Button } from "@repo/design-system/components/ui/button";
import { Plus } from "lucide-react";

type CardQuickAddTriggerProps = {
  onClick: () => void;
};

export const CardQuickAddTrigger = ({ onClick }: CardQuickAddTriggerProps) => (
  <Button
    className="w-full justify-start text-white/90 hover:bg-white/15 hover:text-white/90"
    onClick={onClick}
    type="button"
    variant="ghost"
  >
    <Plus aria-hidden className="size-4 shrink-0" />
    Add a card
  </Button>
);

/** Non-interactive shell matching `CardQuickAddTrigger` (e.g. column drag overlay). */
export function CardQuickAddChrome() {
  return (
    <div
      aria-hidden
      className="flex h-9 w-full items-center justify-start gap-2 rounded-md border border-transparent bg-white/10 px-3 text-sm text-white/90"
    >
      <Plus className="size-4 shrink-0 opacity-90" />
      Add a card
    </div>
  );
}
