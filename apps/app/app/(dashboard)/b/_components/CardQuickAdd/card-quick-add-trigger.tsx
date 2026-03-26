import { Button } from "@repo/design-system/components/ui/button";
import { Plus } from "lucide-react";

type CardQuickAddTriggerProps = {
  onClick: () => void;
};

export const CardQuickAddTrigger = ({ onClick }: CardQuickAddTriggerProps) => (
  <Button
    type="button"
    variant="secondary"
    className="w-full justify-start bg-white/10 text-white/90 hover:bg-white/15"
    onClick={onClick}
  >
    <Plus className="size-4 shrink-0" aria-hidden />
    Add a card
  </Button>
);
