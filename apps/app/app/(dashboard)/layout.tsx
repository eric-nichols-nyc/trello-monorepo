import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/navigation/dashboard-sidebar";
import { GlobalHeader } from "./dashboard/_components/global-header";

type DashboardLayoutProps = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-background">
    <GlobalHeader />
    <div className="flex min-h-0 min-w-0 flex-1">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 overflow-auto bg-background p-8 text-foreground">
        {children}
      </main>
    </div>
  </div>
);

export default DashboardLayout;
