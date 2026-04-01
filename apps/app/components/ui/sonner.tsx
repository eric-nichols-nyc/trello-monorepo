"use client";

/**
 * Shadcn-style Sonner wrapper (implementation lives in `@repo/design-system`).
 * The global `<Toaster />` is already rendered inside `DesignSystemProvider` in
 * `app/layout.tsx` — do not mount a second instance.
 */
export { Toaster } from "@repo/design-system/components/ui/sonner";
