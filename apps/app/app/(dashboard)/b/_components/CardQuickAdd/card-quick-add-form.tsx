import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { X } from "lucide-react";

type CardQuickAddFormProps = {
  onClose: () => void;
};

export const CardQuickAddForm = ({ onClose }: CardQuickAddFormProps) => (
  <form
    className="flex flex-col gap-2"
    onSubmit={(event) => {
      event.preventDefault();
    }}
  >
    <div className="flex gap-1">
      <Input
        autoFocus
        className="flex-1 bg-[rgb(36,37,40)] text-white placeholder:text-white/40"
        placeholder="Enter a title for this card…"
        aria-label="Card title"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="size-4" />
      </Button>
    </div>
    <Button type="submit" className="w-fit">
      Add card
    </Button>
  </form>
);
