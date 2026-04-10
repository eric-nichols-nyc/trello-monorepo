"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { resolvePostAuthPath } from "../lib/workspace-home";
import { safeNextPath } from "./auth-utils";

const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const labelClass = "block text-sm font-medium text-zinc-700";

type LoginFormProps = {
  nextPath?: string | null;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await new Promise<void>((resolve, reject) => {
        authClient.signIn.email(
          { email, password },
          {
            onSuccess: () => resolve(),
            onError: (ctx) =>
              reject(
                new Error(
                  ctx.error.message ?? "Could not sign in. Try again.",
                ),
              ),
          },
        );
      });
      const path = await resolvePostAuthPath(nextPath);
      router.push(path);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="signin-email" className={labelClass}>
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="signin-password" className={labelClass}>
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        No account?{" "}
        <Link
          href={
            nextPath
              ? `/sign-up?next=${encodeURIComponent(safeNextPath(nextPath, "/workspace"))}`
              : "/sign-up"
          }
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}

type SignUpFormProps = {
  nextPath?: string | null;
};

export function SignUpForm({ nextPath }: SignUpFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const callbackURL =
      typeof window !== "undefined"
        ? `${window.location.origin}/sign-in`
        : undefined;

    try {
      await new Promise<void>((resolve, reject) => {
        authClient.signUp.email(
          {
            email,
            password,
            name,
            callbackURL,
          },
          {
            onSuccess: () => resolve(),
            onError: (ctx) =>
              reject(
                new Error(
                  ctx.error.message ??
                    "Could not create account. Try again.",
                ),
              ),
          },
        );
      });
      const path = await resolvePostAuthPath(nextPath);
      router.push(path);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label htmlFor="signup-name" className={labelClass}>
          Name
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="signup-email" className={labelClass}>
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="signup-password" className={labelClass}>
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-zinc-500">
          At least 8 characters (server may require more).
        </p>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link
          href={
            nextPath
              ? `/sign-in?next=${encodeURIComponent(safeNextPath(nextPath, "/workspace"))}`
              : "/sign-in"
          }
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
