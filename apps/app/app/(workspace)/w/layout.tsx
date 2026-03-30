import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/navigation/dashboard-sidebar";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <>
      <DashboardSidebar />
      <main className="min-w-0 flex-1 overflow-auto bg-background p-8 text-foreground">
        {children}
      </main>
    </>
  );
}
