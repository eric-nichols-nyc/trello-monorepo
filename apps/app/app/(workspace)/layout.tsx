import type { ReactNode } from "react";
import { GlobalHeader } from "./w/_components/global-header/global-header";

type DashboardLayoutProps = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-background">
    <GlobalHeader />
    <div className="flex min-h-0 min-w-0 flex-1">{children}</div>
  </div>
);

export default DashboardLayout;
