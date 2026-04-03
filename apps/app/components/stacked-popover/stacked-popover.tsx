"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { ChevronLeft, X } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

type StackedPopoverContextValue = {
  /** `null` when the stack is empty (root view). */
  activeScreen: string | null;
  depth: number;
  push: (screenId: string) => void;
  pop: () => void;
  reset: () => void;
};

const StackedPopoverContext = createContext<StackedPopoverContextValue | null>(
  null
);

export function useStackedPopover() {
  const value = useContext(StackedPopoverContext);
  if (!value) {
    throw new Error(
      "useStackedPopover must be used within StackedPopoverProvider"
    );
  }
  return value;
}

export type StackedPopoverProviderProps = {
  children: ReactNode;
  /** Optional initial stack (e.g. for testing). */
  initialStack?: string[];
};

/**
 * Holds a small navigation stack for drill-down UIs (e.g. menu → form → back).
 * Place inside popover/sheet content; each level is a string id on the stack.
 */
export function StackedPopoverProvider({
  children,
  initialStack = [],
}: StackedPopoverProviderProps) {
  const [stack, setStack] = useState<string[]>(initialStack);

  const value = useMemo<StackedPopoverContextValue>(() => {
    const activeScreen = stack.length === 0 ? null : (stack.at(-1) ?? null);
    return {
      activeScreen,
      depth: stack.length,
      push: (screenId: string) => setStack((prev) => [...prev, screenId]),
      pop: () => setStack((prev) => prev.slice(0, -1)),
      reset: () => setStack([]),
    };
  }, [stack]);

  return (
    <StackedPopoverContext.Provider value={value}>
      {children}
    </StackedPopoverContext.Provider>
  );
}

export type StackedPopoverRootProps = {
  children: ReactNode;
  className?: string;
};

/** Visible when the stack is empty. */
export function StackedPopoverRoot({
  children,
  className,
}: StackedPopoverRootProps) {
  const { activeScreen } = useStackedPopover();
  if (activeScreen !== null) {
    return null;
  }
  return <div className={cn(className)}>{children}</div>;
}

export type StackedPopoverScreenProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

/** Visible when this screen id is the top of the stack. */
export function StackedPopoverScreen({
  id,
  children,
  className,
}: StackedPopoverScreenProps) {
  const { activeScreen } = useStackedPopover();
  if (activeScreen !== id) {
    return null;
  }
  return <div className={cn(className)}>{children}</div>;
}

export type StackedPopoverHeaderProps = {
  title?: string;
  className?: string;
  backButtonLabel?: string;
  /** Disables the back control when shown (deeper than root). */
  backDisabled?: boolean;
  /** Extra props for the back `Button` (`onClick` is always wired to `pop`). */
  backButtonProps?: Omit<
    ComponentProps<typeof Button>,
    "children" | "onClick" | "size" | "type" | "variant"
  >;
  /** When set on a stacked screen, shows a close control (e.g. dismiss the popover). */
  onClose?: () => void;
  closeButtonLabel?: string;
};

/**
 * Root: optional title row (no back). Deeper levels: back control + optional title.
 */
export function StackedPopoverHeader({
  title,
  className,
  backButtonLabel = "Back",
  backDisabled,
  backButtonProps,
  onClose,
  closeButtonLabel = "Close",
}: StackedPopoverHeaderProps) {
  const { depth, pop } = useStackedPopover();
  const {
    className: backClassName,
    disabled: backButtonDisabledProp,
    ...restBackButtonProps
  } = backButtonProps ?? {};

  if (depth === 0) {
    if (!title) {
      return null;
    }
    return (
      <div
        className={cn(
          "border-b px-1 py-2 text-center font-semibold text-sm",
          className
        )}
      >
        {title}
      </div>
    );
  }

  if (onClose !== undefined) {
    return (
      <div
        className={cn(
          "grid min-h-8 grid-cols-[auto_1fr_auto] items-center gap-1 border-b px-1 py-2",
          className
        )}
      >
        <Button
          aria-label={backButtonLabel}
          className={cn("size-8 shrink-0 justify-self-start", backClassName)}
          size="icon-sm"
          type="button"
          variant="ghost"
          {...restBackButtonProps}
          disabled={backDisabled ?? backButtonDisabledProp}
          onClick={pop}
        >
          <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
        </Button>
        {title ? (
          <span className="min-w-0 justify-self-center truncate px-1 text-center font-semibold text-sm">
            {title}
          </span>
        ) : (
          <span aria-hidden className="min-w-0" />
        )}
        <Button
          aria-label={closeButtonLabel}
          className="size-8 shrink-0 justify-self-end"
          onClick={onClose}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X aria-hidden className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-1 border-b px-1 py-2", className)}
    >
      <Button
        aria-label={backButtonLabel}
        className={cn("size-8 shrink-0", backClassName)}
        size="icon-sm"
        type="button"
        variant="ghost"
        {...restBackButtonProps}
        disabled={backDisabled ?? backButtonDisabledProp}
        onClick={pop}
      >
        <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
      </Button>
      {title ? (
        <span className="min-w-0 flex-1 truncate font-semibold text-sm">
          {title}
        </span>
      ) : null}
    </div>
  );
}
