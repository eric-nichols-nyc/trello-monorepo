"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@repo/clerk/client";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandWordmark } from "./brand-wordmark";

const navLinkClass =
  "text-muted-foreground text-sm transition-colors hover:text-foreground";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link className={navLinkClass} href="#features" onClick={onNavigate}>
        Features
      </Link>
      <Link className={navLinkClass} href="#solutions" onClick={onNavigate}>
        Solutions
      </Link>
      <Link className={navLinkClass} href="#pricing" onClick={onNavigate}>
        Pricing
      </Link>
      <Link className={navLinkClass} href="#resources" onClick={onNavigate}>
        Resources
      </Link>
    </>
  );
}

function AuthActions({ className }: { className?: string }) {
  return (
    <div className={className}>
      <SignedOut>
        <SignInButton mode="redirect">
          <Button
            className="text-muted-foreground hover:text-foreground"
            variant="ghost"
          >
            Log in
          </Button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <Button>Get started free</Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
        <Button asChild variant="outline">
          <Link href="/w">Workspace</Link>
        </Button>
      </SignedIn>
    </div>
  );
}

/**
 * Fixed marketing header: brand, in-page nav, Clerk auth, theme toggle, mobile menu.
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-border border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            aria-label="Trellnode home"
            className="flex items-center gap-2"
            href="/"
            onClick={closeMobile}
          >
            <BrandWordmark />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLinks />
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <AuthActions className="flex items-center gap-2" />
          <ModeToggle />
        </div>

        <button
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="rounded-md p-2 md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          type="button"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-border border-t bg-background md:hidden">
          <nav className="flex flex-col gap-4 p-6">
            <NavLinks onNavigate={closeMobile} />
            <div className="flex flex-col gap-2 border-border border-t pt-4">
              <AuthActions className="flex flex-col gap-2" />
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground text-sm">Theme</span>
                <ModeToggle />
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
