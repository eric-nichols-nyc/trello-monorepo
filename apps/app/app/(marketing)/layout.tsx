import type { ReactNode } from "react";

type MarketingLayoutProps = {
  readonly children: ReactNode;
};

/**
 * Body uses `overflow: hidden` for dashboard shells; marketing needs its own
 * scroll container so long landing content is reachable.
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden overscroll-y-contain">
      {children}
    </div>
  );
}
