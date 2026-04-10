"use client";

import { useAuth } from "@repo/clerk/client";
import { Button } from "@repo/design-system/components/ui/button";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/design-system/components/ui/tabs";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { cn } from "@repo/design-system/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useClickOutside } from "@/hooks/use-click-outside";
import {
  fitFixedPanelInViewport,
  type AnchorViewportRect,
} from "@/lib/ui/portal-panel-viewport";
import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";
import { postCardClient } from "@/lib/api/cards/post-card-client";
import { toast } from "@/lib/toast";
import { boardDetailQueryKey } from "@/queries/board-detail-query";
import {
  buildCopyInput,
  findCardInBoard,
} from "@/queries/use-copy-card";
import type {
  BoardCard,
  BoardChecklist,
  BoardDetail,
} from "@/types/board-detail";

/** Marks the portaled panel so parent menus can ignore “outside” clicks on it. */
export const COPY_CARD_POPOVER_ATTR = "data-copy-card-popover";

export function isWithinCopyCardPopover(target: EventTarget | null): boolean {
  return (
    typeof Element !== "undefined" &&
    target instanceof Element &&
    target.closest(`[${COPY_CARD_POPOVER_ATTR}]`) !== null
  );
}

const panelFieldClass =
  "border-zinc-600 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-sky-500 focus-visible:ring-sky-500/40";

const selectTriggerClass = cn(
  "h-9 w-full border-zinc-600 bg-zinc-900 text-zinc-100",
  "focus-visible:border-sky-500 focus-visible:ring-sky-500/40"
);

function computeInsertionPos(
  sortedCards: BoardCard[],
  position1Based: number
): number {
  const n = sortedCards.length;
  const slot = Math.max(1, Math.min(position1Based, n + 1));
  if (n === 0) {
    return 1000;
  }
  if (slot === 1) {
    return sortedCards[0].pos - 1000;
  }
  if (slot === n + 1) {
    return sortedCards[n - 1].pos + 1000;
  }
  const prev = sortedCards[slot - 2];
  const next = sortedCards[slot - 1];
  return (prev.pos + next.pos) / 2;
}

async function postChecklistForCard(
  cardId: string,
  body: { name: string; pos: number },
  token: string
): Promise<{ id: string }> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/cards/${encodeURIComponent(cardId)}/checklists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`
    );
  }
  const data = (await response.json()) as { id: string };
  return data;
}

async function postChecklistItem(
  checklistId: string,
  body: { name: string; pos: number; completed: boolean },
  token: string
): Promise<void> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/checklists/${encodeURIComponent(checklistId)}/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`
    );
  }
}

async function cloneChecklistsToCard(
  newCardId: string,
  checklists: BoardChecklist[],
  token: string
): Promise<void> {
  const ordered = [...checklists].sort((a, b) => a.pos - b.pos);
  for (const cl of ordered) {
    const created = await postChecklistForCard(
      newCardId,
      { name: cl.name, pos: cl.pos },
      token
    );
    const items = [...cl.items].sort((a, b) => a.pos - b.pos);
    for (const item of items) {
      await postChecklistItem(
        created.id,
        {
          name: item.name,
          pos: item.pos,
          completed: item.completed,
        },
        token
      );
    }
  }
}

type FoundCard = NonNullable<ReturnType<typeof findCardInBoard>>;

type RunCopyCardArgs = {
  found: FoundCard;
  board: BoardDetail;
  name: string;
  listId: string;
  sortedTargetCards: BoardCard[];
  positionSlot: string;
  positionCount: number;
  keepChecklists: boolean;
  keepLabels: boolean;
  labelCount: number;
  token: string;
};

async function runCopyCard({
  found,
  board,
  name,
  listId,
  sortedTargetCards,
  positionSlot,
  positionCount,
  keepChecklists,
  keepLabels,
  labelCount,
  token,
}: RunCopyCardArgs): Promise<void> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("Name is required");
  }
  const listOk = board.lists.some((l) => l.id === listId);
  if (!listOk) {
    throw new Error("List not found");
  }
  const slot = Number.parseInt(positionSlot, 10);
  const pos = computeInsertionPos(
    sortedTargetCards,
    Number.isNaN(slot) ? positionCount : slot
  );
  const input = buildCopyInput(found.card);
  input.name = trimmed;
  input.pos = pos;

  const created = (await postCardClient(listId, input, token)) as {
    id: string;
  };
  if (
    keepChecklists === true &&
    found.card.checklists.length > 0 &&
    created.id
  ) {
    await cloneChecklistsToCard(created.id, found.card.checklists, token);
  }
  if (keepLabels === true && labelCount > 0) {
    toast.info("Label copy is not available yet.");
  }
}

export type CopyCardPopoverProps = {
  readonly boardKey: string;
  readonly cardId: string;
  readonly board: BoardDetail;
  readonly position: { left: number; top: number };
  readonly anchorViewport: AnchorViewportRect;
  readonly onClose: () => void;
  /** Clicks on this subtree (e.g. the menu trigger) do not count as outside. */
  readonly ignorePointerOutsideRef?: RefObject<HTMLElement | null>;
  /**
   * Label count on the source card (board payload does not include labels yet).
   * When `0`, “Keep labels” is disabled.
   */
  readonly labelCount?: number;
};

export function CopyCardPopover({
  boardKey,
  cardId,
  board,
  position,
  anchorViewport,
  onClose,
  ignorePointerOutsideRef,
  labelCount = 0,
}: CopyCardPopoverProps) {
  const nameFieldId = useId();
  const keepChecklistsFieldId = useId();
  const keepLabelsFieldId = useId();
  const panelReference = useRef<HTMLDivElement>(null);
  const [placedAt, setPlacedAt] = useState(() => position);
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const found = useMemo(
    () => findCardInBoard(board, cardId),
    [board, cardId]
  );

  const [name, setName] = useState("");
  const [keepChecklists, setKeepChecklists] = useState(true);
  const [keepLabels, setKeepLabels] = useState(false);
  const [listId, setListId] = useState(
    () => findCardInBoard(board, cardId)?.list.id ?? ""
  );
  const [positionSlot, setPositionSlot] = useState("1");

  useLayoutEffect(() => {
    if (!found) {
      return;
    }
    setName(found.card.name.trim() || "Card");
    setKeepChecklists(found.card.checklists.length > 0);
    setKeepLabels(labelCount > 0);
    setListId(found.list.id);
  }, [found, labelCount]);

  const targetList = useMemo(
    () => board.lists.find((l) => l.id === listId),
    [board.lists, listId]
  );

  const sortedTargetCards = useMemo(() => {
    if (!targetList) {
      return [];
    }
    return [...targetList.cards].sort((a, b) => a.pos - b.pos);
  }, [targetList]);

  const positionCount = sortedTargetCards.length + 1;

  useEffect(() => {
    setPositionSlot(String(positionCount));
  }, [positionCount]);

  useLayoutEffect(() => {
    const el = panelReference.current;
    if (!el) {
      return;
    }
    const apply = () => {
      setPlacedAt(
        fitFixedPanelInViewport({ el, position, anchorViewport })
      );
    };
    apply();
    const observer = new ResizeObserver(() => apply());
    observer.observe(el);
    return () => observer.disconnect();
  }, [position, anchorViewport]);

  useClickOutside(
    panelReference,
    onClose,
    true,
    ignorePointerOutsideRef ? [ignorePointerOutsideRef] : undefined
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!found) {
        throw new Error("Card not found");
      }
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      await runCopyCard({
        found,
        board,
        name,
        listId,
        sortedTargetCards,
        positionSlot,
        positionCount,
        keepChecklists,
        keepLabels,
        labelCount,
        token,
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: boardDetailQueryKey(boardKey) })
        .catch(() => {
          /* best-effort */
        });
      onClose();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not copy card"
      );
    },
  });

  const checklistCount = found?.card.checklists.length ?? 0;

  const openLists = board.lists.filter((l) => l.closed !== true);

  return (
    <div
      ref={panelReference}
      {...{ [COPY_CARD_POPOVER_ATTR]: "" }}
      aria-label="Copy card"
      aria-modal="true"
      className={cn(
        "fixed z-200 w-[min(100vw-1rem,360px)] select-text rounded-xl border border-zinc-600/80 bg-zinc-800 text-zinc-100 shadow-lg",
        found
          ? "flex max-h-[min(100dvh-2rem,100vh-2rem)] flex-col overflow-hidden"
          : "p-4"
      )}
      onPointerDown={(event) => event.stopPropagation()}
      role="dialog"
      style={{ left: placedAt.left, top: placedAt.top }}
    >
      {found === null ? (
        <>
          <p className="text-sm">This card is not on the board anymore.</p>
          <Button
            className="mt-3"
            onClick={onClose}
            type="button"
            variant="secondary"
          >
            Close
          </Button>
        </>
      ) : (
        <>
      <div className="relative shrink-0 border-zinc-600/80 border-b px-10 py-3">
        <h2 className="text-center font-semibold text-base text-zinc-100">
          Copy card
        </h2>
        <Button
          aria-label="Close"
          className={cn(
            "-translate-y-1/2 absolute top-1/2 right-1.5 size-8 shrink-0 rounded-md",
            "text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100",
            "focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/80"
          )}
          onClick={onClose}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X aria-hidden className="size-4" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain px-4 py-3">
        <Tabs className="gap-0" defaultValue="board">
          <TabsList
            className={cn(
              "h-auto w-full justify-start gap-8 rounded-none border-zinc-600/80 border-b bg-transparent p-0"
            )}
          >
            <TabsTrigger
              className={cn(
                "rounded-none border-0 border-transparent border-b-2 bg-transparent px-0 pb-2 text-sm data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              )}
              disabled
              value="inbox"
            >
              Inbox
            </TabsTrigger>
            <TabsTrigger
              className={cn(
                "rounded-none border-0 border-transparent border-b-2 bg-transparent px-0 pb-2 text-sm text-zinc-100 data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              )}
              value="board"
            >
              Board
            </TabsTrigger>
          </TabsList>
          <TabsContent className="sr-only" value="inbox">
            Inbox copy is not available.
          </TabsContent>
          <TabsContent className="mt-3 flex flex-col gap-4" value="board">
            <div className="flex flex-col gap-1.5">
              <Label
                className="text-xs text-zinc-400"
                htmlFor={nameFieldId}
              >
                Name
              </Label>
              <Textarea
                className={cn("min-h-[72px] text-sm", panelFieldClass)}
                id={nameFieldId}
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-xs text-zinc-400">
                Keep…
              </span>
              <div
                className={cn(
                  "flex items-center gap-2 text-sm",
                  checklistCount === 0 && "cursor-not-allowed opacity-50"
                )}
              >
                <Checkbox
                  checked={keepChecklists}
                  disabled={checklistCount === 0}
                  id={keepChecklistsFieldId}
                  onCheckedChange={(v) => {
                    if (v === "indeterminate") {
                      return;
                    }
                    setKeepChecklists(v);
                  }}
                />
                <Label
                  className={cn(
                    "font-normal text-zinc-200",
                    checklistCount > 0 && "cursor-pointer"
                  )}
                  htmlFor={keepChecklistsFieldId}
                >
                  Checklists ({checklistCount})
                </Label>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 text-sm",
                  labelCount === 0 && "cursor-not-allowed opacity-50"
                )}
              >
                <Checkbox
                  checked={keepLabels}
                  disabled={labelCount === 0}
                  id={keepLabelsFieldId}
                  onCheckedChange={(v) => {
                    if (v === "indeterminate") {
                      return;
                    }
                    setKeepLabels(v);
                  }}
                />
                <Label
                  className={cn(
                    "font-normal text-zinc-200",
                    labelCount > 0 && "cursor-pointer"
                  )}
                  htmlFor={keepLabelsFieldId}
                >
                  Labels ({labelCount})
                </Label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-semibold text-xs text-zinc-400">
                Copy to…
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-zinc-500">Board</span>
                <Select disabled value="current">
                  <SelectTrigger className={selectTriggerClass} size="sm">
                    <SelectValue placeholder={board.name} />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-600 bg-zinc-800 text-zinc-100">
                    <SelectItem value="current">{board.name}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex min-w-0 flex-[2] flex-col gap-1.5">
                  <span className="text-xs text-zinc-500">List</span>
                  <Select
                    onValueChange={(v) => setListId(v)}
                    value={listId || undefined}
                  >
                    <SelectTrigger className={selectTriggerClass} size="sm">
                      <SelectValue placeholder="List" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-600 bg-zinc-800 text-zinc-100">
                      {openLists.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-xs text-zinc-500">Position</span>
                  <Select
                    onValueChange={setPositionSlot}
                    value={positionSlot}
                  >
                    <SelectTrigger className={selectTriggerClass} size="sm">
                      <SelectValue placeholder="1" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-600 bg-zinc-800 text-zinc-100">
                      {Array.from({ length: positionCount }, (_, i) => {
                        const n = i + 1;
                        return (
                          <SelectItem key={n} value={String(n)}>
                            {String(n)}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="shrink-0 border-zinc-600/80 border-t px-4 py-3">
        <Button
          className={cn(
            "bg-sky-500 font-medium text-zinc-950 hover:bg-sky-400",
            "focus-visible:ring-sky-400/80"
          )}
          disabled={createMutation.isPending || name.trim().length === 0}
          onClick={() => createMutation.mutate()}
          type="button"
        >
          {createMutation.isPending ? "Creating…" : "Create card"}
        </Button>
      </div>
        </>
      )}
    </div>
  );
}
