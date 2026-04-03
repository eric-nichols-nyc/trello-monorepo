"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { BoardCard } from "@/types/board-detail";

type CardRouteDetailProps = {
  boardKey: string;
  card: BoardCard;
  listName: string;
  boardName: string;
  mode: "modal" | "page";
};

export function CardRouteDetail({
  boardKey,
  card,
  listName,
  boardName,
  mode,
}: CardRouteDetailProps) {
  const router = useRouter();
  const backHref = `/b/${encodeURIComponent(boardKey)}`;

  const meta = (
    <p className="text-sm text-white/50">
      {boardName} · {listName}
    </p>
  );

  const descriptionBlock =
    card.description !== null && card.description.length > 0 ? (
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
        {card.description}
      </p>
    ) : (
      <p className="mt-3 text-sm text-white/45">No description.</p>
    );

  if (mode === "modal") {
    return (
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            router.back();
          }
        }}
        open
      >
        <DialogContent
          className="top-[50px] max-h-[calc(100vh-50px-1rem)] translate-y-0 overflow-y-auto border-[rgb(54,55,58)] bg-[rgb(36,37,40)] text-white sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="pr-8 text-left text-xl font-semibold text-white">
              {card.name}
            </DialogTitle>
          </DialogHeader>
          {meta}
          {descriptionBlock}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <Link
          className="text-sm text-white/55 underline-offset-4 hover:text-white hover:underline"
          href={backHref}
        >
          ← Back to board
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-white">{card.name}</h1>
        <div className="mt-2">{meta}</div>
        {descriptionBlock}
      </div>
    </div>
  );
}
