"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/design-system/components/ui/accordion";
import { Separator } from "@repo/design-system/components/ui/separator";
import {
  Home,
  LayoutGrid,
  LayoutTemplate,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useWorkspaceShellWorkspaces } from "@/app/(workspace)/_components/workspace-shell-context";
import {
  resolveWorkspaceFromSegment,
  workspaceSegmentFromPathname,
} from "@/lib/workspaces/workspace-routing";

const linkClassName =
  "flex items-center gap-3 rounded-md px-2 py-1.5 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-80";

const accordionLinkClassName =
  "flex items-center gap-3 rounded-md py-1.5 pr-2 pl-8 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-80";

const workspaceAvatarGradient = {
  backgroundImage:
    "linear-gradient(180deg, rgb(134 239 172) 0%, rgb(22 101 52) 100%)",
} as const;

function workspaceInitial(name: string): string {
  const first = name.trim()[0];
  return first !== undefined ? first.toUpperCase() : "?";
}

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const workspaces = useWorkspaceShellWorkspaces();

  const { displayName, initial } = useMemo(() => {
    const segment = workspaceSegmentFromPathname(pathname);
    const active =
      segment !== null
        ? resolveWorkspaceFromSegment(workspaces, segment)
        : workspaces[0];
    const name = active?.name ?? "Workspace";
    return { displayName: name, initial: workspaceInitial(name) };
  }, [pathname, workspaces]);

  return (
    <aside className="flex min-h-0 w-[288px] shrink-0 flex-col overflow-y-auto border-sidebar-border border-r p-8 text-sidebar-foreground">
      <nav className="-mx-8 border-chrome-divider border-b px-8 pb-4">
        <ul className="list-none space-y-2 p-0">
          <li>
            <Link className={linkClassName} href="/w">
              <LayoutGrid aria-hidden />
              Boards
            </Link>
          </li>
          <li>
            <Link className={linkClassName} href="#">
              <LayoutTemplate aria-hidden />
              Templates
            </Link>
          </li>
          <li>
            <Link className={linkClassName} href="#">
              <Home aria-hidden />
              Home
            </Link>
          </li>
        </ul>

        <Separator className="mt-4 bg-chrome-divider" decorative />

        <Accordion
          className="w-full"
          collapsible
          defaultValue="workspace"
          type="single"
        >
          <AccordionItem className="border-0" value="workspace">
            <AccordionTrigger className="items-center rounded-md py-2 pr-1 pl-0 text-left hover:bg-sidebar-accent/40 hover:no-underline [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:translate-y-0 [&>svg]:text-sidebar-foreground/60 data-[state=open]:[&>svg]:text-sidebar-foreground/60">
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-md font-bold text-[13px] text-zinc-800"
                  style={workspaceAvatarGradient}
                >
                  {initial}
                </span>
                <span className="truncate font-medium text-[13px] text-sidebar-foreground leading-snug">
                  {displayName}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <ul className="list-none space-y-1 p-0">
                <li>
                  <Link className={accordionLinkClassName} href="/w">
                    <LayoutGrid aria-hidden />
                    Boards
                  </Link>
                </li>
                <li>
                  <Link className={accordionLinkClassName} href="/w/members">
                    <Users aria-hidden />
                    Members
                  </Link>
                </li>
                <li>
                  <Link className={accordionLinkClassName} href="/w/settings">
                    <Settings aria-hidden />
                    Settings
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </nav>
    </aside>
  );
};
