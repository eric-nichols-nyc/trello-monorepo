import type { ReactNode } from "react";

type BoardLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

export default function BoardLayout({ children, modal }: BoardLayoutProps) {
  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      {children}
      {modal}
    </div>
  );
}
