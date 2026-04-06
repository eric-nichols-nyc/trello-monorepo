"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

type HeaderSearchBoardRowLinkProperties = {
  readonly href: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly previewStyle: CSSProperties;
  readonly onClick?: () => void;
};

export const HeaderSearchBoardRowLink = ({
  href,
  title,
  subtitle,
  previewStyle,
  onClick,
}: HeaderSearchBoardRowLinkProperties) => (
  <li className="w-full">
    <Link
      className="flex w-full min-w-0 items-center gap-3 px-3 py-2 no-underline outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent/60"
      href={href}
      onClick={onClick}
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
