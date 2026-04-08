"use client";

import { useUpdateBoardStarred } from "@/queries/use-update-board-starred";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

export type BoardHeaderStarButtonProps = {
  readonly boardId: string;
  readonly boardKey: string;
  readonly starred: boolean;
  readonly className?: string;
};

/**
 * Star / unstar the current board; uses {@link useUpdateBoardStarred} (optimistic cache + `router.refresh`).
 */
export function BoardHeaderStarButton({
  boardId,
  boardKey,
  starred,
  className,
}: BoardHeaderStarButtonProps) {
  const { isPending, mutate } = useUpdateBoardStarred();
  const [isStarred, setIsStarred] = useState(starred);

  useEffect(() => {
    setIsStarred(starred);
  }, [starred]);

  const handleClick = () => {
    if (isPending) {
      return;
    }
    const next = !isStarred;
    setIsStarred(next);
    mutate(
      { boardId, boardKey, starred: next },
      {
        onError: () => {
          setIsStarred(starred);
        },
      }
    );
  };

  return (
    <Button
      aria-label={isStarred ? "Unstar board" : "Star board"}
      className={cn(
        "size-8 text-white/90 hover:bg-white/10 hover:text-white",
        className
      )}
      disabled={isPending}
      onClick={handleClick}
      size="icon"
      type="button"
      variant="ghost"
    >
      <Star
        aria-hidden
        className={cn("size-4", isStarred ? "fill-current" : "fill-transparent")}
        strokeWidth={2}
      />
    </Button>
  );
}
