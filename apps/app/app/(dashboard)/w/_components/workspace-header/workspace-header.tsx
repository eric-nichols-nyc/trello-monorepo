import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";

type WorkspaceHeaderProperties = {
  readonly title: string;
  readonly leading?: ReactNode;
  readonly className?: string;
  readonly id?: string;
};

export const WorkspaceHeader = ({
  title,
  leading,
  className,
  id,
}: WorkspaceHeaderProperties) => (
  <h2
    className={cn(
      "flex items-center gap-2 font-semibold text-foreground text-lg tracking-tight",
      className
    )}
    id={id}
  >
    {leading}
    {title}
  </h2>
);
