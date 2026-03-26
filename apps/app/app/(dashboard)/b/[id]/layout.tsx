import type { ReactNode } from "react";

type BoardLayoutProps = {
  children: ReactNode;
};

export default function BoardLayout({ children }: BoardLayoutProps) {
  return <div className="min-w-0 flex-1">{children}</div>;
}
