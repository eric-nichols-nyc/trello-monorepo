import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-zinc-600">{subtitle}</p>
          ) : null}
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white p-8 shadow-sm">
          {children}
        </div>
        {footer ? (
          <div className="mt-6 text-center text-sm text-zinc-600">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
