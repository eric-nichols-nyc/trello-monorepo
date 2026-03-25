import Link from "next/link";

export const DashboardSidebar = () => (
  <aside className="w-[220px] shrink-0 border-sidebar-border border-r p-8 text-sidebar-foreground">
    <nav className="-mx-8 border-chrome-divider border-b px-8 pb-4">
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
);
