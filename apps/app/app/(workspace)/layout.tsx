import type { ReactNode } from "react";
import { getMyWorkspaces } from "@/lib/api/workspaces/get-my-workspaces";
import { GlobalHeader } from "./w/_components/global-header/global-header";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  let defaultWorkspaceId: string | null = null;
  try {
    const workspaces = await getMyWorkspaces();
    defaultWorkspaceId = workspaces[0]?.id ?? null;
  } catch {
    defaultWorkspaceId = null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GlobalHeader workspaceId={defaultWorkspaceId} />
      <div className="flex min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}
