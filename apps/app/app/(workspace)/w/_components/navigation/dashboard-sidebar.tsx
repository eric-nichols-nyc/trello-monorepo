"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/design-system/components/ui/accordion";
import { Separator } from "@repo/design-system/components/ui/separator";
import { Home, LayoutGrid, LayoutTemplate, Settings, Users } from "lucide-react";
import Link from "next/link";

const linkClassName =
  "flex items-center gap-3 rounded-md px-2 py-1.5 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-80";

const accordionLinkClassName =
  "flex items-center gap-3 rounded-md py-1.5 pr-2 pl-8 text-sidebar-foreground text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-80";

export const DashboardSidebar = () => (
  <aside className="w-[288px] shrink-0 border-sidebar-border border-r p-8 text-sidebar-foreground">
    <nav className="-mx-8 border-chrome-divider border-b px-8 pb-4">
      <ul className="list-none space-y-2 p-0">
        <li>
          <Link className={linkClassName} href="/w">
            <LayoutGrid aria-hidden />
            Board
          </Link>
        </li>
        <li>
          <Link className={linkClassName} href="/w/templates">
            <LayoutTemplate aria-hidden />
            Templates
          </Link>
        </li>
        <li>
          <Link className={linkClassName} href="/">
            <Home aria-hidden />
            Home
          </Link>
        </li>
      </ul>

      <Separator className="mt-4 bg-chrome-divider" decorative />

      <Accordion className="w-full"
        collapsible
        defaultValue="workspace"
        type="single"
      >
        <AccordionItem className="border-0" value="workspace">
          <AccordionTrigger className="py-2 text-sidebar-foreground text-sm hover:no-underline [&>svg]:text-sidebar-foreground/70">
            Workspace
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
