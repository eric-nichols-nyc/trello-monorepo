import type { ReactNode } from "react";

type BoardLayoutProps = {
  children: ReactNode;
};

export default function BoardLayout({ children }: BoardLayoutProps) {
  return <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>;
}
