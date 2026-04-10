"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../components/auth-provider";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, session, router, pathname]);

  if (isLoading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
