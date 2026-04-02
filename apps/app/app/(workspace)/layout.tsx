import type { ReactNode } from "react";
import { getMyWorkspaces } from "@/lib/api/workspaces/get-my-workspaces";
import { GlobalHeader } from "./w/_components/global-header/global-header";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  let defaultWorkspaceId: string | null = null;
  try {
    const workspaces = await getMyWorkspaces();
    defaultWorkspaceId = workspaces[0]?.id ?? null;
  } catch {
    defaultWorkspaceId = null;
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <GlobalHeader workspaceId={defaultWorkspaceId} />
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
