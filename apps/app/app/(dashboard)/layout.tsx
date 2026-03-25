import Link from "next/link";
import type { ReactNode } from "react";
import { GlobalHeader } from "./dashboard/_components/global-header";

type DashboardLayoutProps = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: DashboardLayoutProps) => (
  <div className="flex min-h-screen bg-background">
    <aside className="w-[220px] shrink-0 border-sidebar-border border-r bg-sidebar p-8 text-sidebar-foreground">
      <nav>
        <ul className="list-none space-y-2 p-0">
          <li>
            <Link
              className="block rounded-md px-2 py-1.5 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              href="/dashboard"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              className="block rounded-md px-2 py-1.5 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              href="/dashboard/profile"
            >
              Profile
            </Link>
          </li>
          <li>
            <Link
              className="block rounded-md px-2 py-1.5 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              href="/dashboard/settings"
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col">
      <GlobalHeader />
      <main className="flex-1 bg-background p-8 text-foreground">
        {children}
      </main>
    </div>
  </div>
);

export default DashboardLayout;
