"use client";

import { Input } from "@repo/design-system/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
import {
  getBoardId,
  getBoardStringField,
  getBoardWorkspaceId,
  getPreviewBackgroundStyle,
  sortBoardsRecentFirst,
} from "@/lib/boards/board-list-utils";
import { Search } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from "react";

/** Workspace id + name (same shape as the shell workspace list; safe for client props). */
export type HeaderSearchWorkspaceSummary = {
  readonly id: string;
  readonly name: string;
};

type HeaderSearchBoardsPopoverProps = Omit<
  ComponentProps<typeof Input>,
  "defaultValue" | "onChange" | "onKeyDown" | "type" | "value"
> & {
  readonly containerClassName?: string;
  readonly initialBoards: readonly unknown[];
  readonly workspaceSummaries: readonly HeaderSearchWorkspaceSummary[];
  readonly onChange?: ComponentProps<typeof Input>["onChange"];
  readonly onKeyDown?: ComponentProps<typeof Input>["onKeyDown"];
};

function workspaceLabelForBoard(
  board: unknown,
  summaries: readonly HeaderSearchWorkspaceSummary[]
): string | undefined {
  const fromApi = getBoardStringField(board, "workspaceName");
  if (fromApi !== undefined) {
    return fromApi;
  }
  const workspaceId = getBoardWorkspaceId(board);
  if (workspaceId === undefined) {
    return;
  }
  return summaries.find((w) => w.id === workspaceId)?.name;
}

export const HeaderSearchBoardsPopover = ({
  className,
  containerClassName,
  initialBoards,
  workspaceSummaries,
  placeholder = "Search Trello",
  "aria-label": ariaLabel,
  onChange,
  onKeyDown,
  ...inputProperties
}: HeaderSearchBoardsPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLDivElement>(null);
  const [anchorWidthPx, setAnchorWidthPx] = useState(0);

  useLayoutEffect(() => {
    const element = anchorRef.current;
    if (!element) {
      return;
    }
    const measure = () => {
      setAnchorWidthPx(element.getBoundingClientRect().width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const orderedBoards = useMemo(
    () => sortBoardsRecentFirst(initialBoards),
    [initialBoards]
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredBoards = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return orderedBoards;
    }
    return orderedBoards.filter((board) => {
      const name = getBoardStringField(board, "name")?.toLowerCase() ?? "";
      const ws = workspaceLabelForBoard(
        board,
        workspaceSummaries
      )?.toLowerCase();
      return (
        name.includes(normalizedQuery) ||
        (ws !== undefined && ws.includes(normalizedQuery))
      );
    });
  }, [normalizedQuery, orderedBoards, workspaceSummaries]);

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented && event.key === "Escape") {
        setOpen(false);
      }
    },
    [onKeyDown]
  );

  return (
    <Popover modal={false} onOpenChange={onOpenChange} open={open}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={cn("relative min-w-0 w-full flex-1", containerClassName)}
          data-testid="header-search-input"
        >
          <Search
            aria-hidden
            className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
          />
          <Input
            {...inputProperties}
            aria-expanded={open}
            aria-label={ariaLabel ?? placeholder}
            autoComplete="off"
            className={cn("h-9 border-chrome-divider pl-9", className)}
            onChange={(event) => {
              onChange?.(event);
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={(event) => {
              inputProperties.onFocus?.(event);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            type="search"
            value={query}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="max-h-[min(420px,70dvh)] max-w-[min(100vw-1.5rem,780px)] overflow-hidden p-0 shadow-lg"
        collisionPadding={12}
        onOpenAutoFocus={(event) => event.preventDefault()}
        sideOffset={6}
        style={
          anchorWidthPx > 0
            ? { width: anchorWidthPx, minWidth: anchorWidthPx }
            : undefined
        }
      >
        <div className="border-chrome-divider border-b px-3 py-2">
          <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
            Recent boards
          </p>
        </div>
        <div className="max-h-[min(360px,60dvh)] w-full overflow-y-auto py-1">
          {filteredBoards.length === 0 ? (
            <p className="px-3 py-6 text-center text-muted-foreground text-sm">
              {orderedBoards.length === 0
                ? "No boards yet"
                : "No boards match your search"}
            </p>
          ) : (
            <ul className="w-full space-y-0.5">
              {filteredBoards.map((board, index) => {
                const shortLink = getBoardStringField(board, "shortLink");
                const id = getBoardId(board);
                const name = getBoardStringField(board, "name");
                const title = name ?? shortLink ?? id ?? "Board";
                const boardKey = shortLink ?? id;
                const href =
                  boardKey !== undefined ? `/b/${boardKey}` : undefined;
                const subtitle = workspaceLabelForBoard(
                  board,
                  workspaceSummaries
                );
                const previewStyle = getPreviewBackgroundStyle(board);
                const key = id ?? shortLink ?? String(index);

                if (href === undefined) {
                  return (
                    <li className="w-full px-3 py-2" key={key}>
                      <span className="block w-full text-muted-foreground text-sm">
                        {title}
                      </span>
                    </li>
                  );
                }

                return (
                  <li className="w-full" key={key}>
                    <Link
                      className="flex w-full min-w-0 items-center gap-3 px-3 py-2 no-underline outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent/60"
                      href={href}
                      onClick={() => setOpen(false)}
                    >
                      <div
                        className="size-8 shrink-0 overflow-hidden rounded-md bg-center bg-cover shadow-sm ring-1 ring-black/10 ring-inset dark:ring-white/10"
                        style={previewStyle}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground text-sm leading-snug">
                          {title}
                        </p>
                        {subtitle !== undefined ? (
                          <p className="truncate text-muted-foreground text-xs leading-snug">
                            {subtitle}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
