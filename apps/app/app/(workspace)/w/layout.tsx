import type { ReactNode } from "react";
import { DashboardSidebar } from "./_components/navigation/dashboard-sidebar";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <>
      <DashboardSidebar />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background p-8 text-foreground">
        {children}
      </main>
    </>
  );
}
