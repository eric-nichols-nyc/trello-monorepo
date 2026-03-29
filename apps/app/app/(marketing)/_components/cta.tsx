"use client";

import { SignUpButton } from "@repo/clerk/client";
import { Button } from "@repo/design-system/components/ui/button";
import { ArrowRight } from "lucide-react";

/** Closing conversion band before the footer. */
export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-16">
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="text-balance font-bold text-3xl text-foreground tracking-tight md:text-4xl">
              Ready to transform how your team works?
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Join millions of teams using App to ship better products, faster.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignUpButton mode="modal">
                <Button className="gap-2" size="lg">
                  Start free today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </SignUpButton>
              <Button size="lg" type="button" variant="outline">
                Talk to sales
              </Button>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="-top-20 -right-20 absolute h-64 w-64 rounded-full bg-muted opacity-50" />
            <div className="-bottom-32 -left-32 absolute h-96 w-96 rounded-full bg-muted opacity-30" />
          </div>
        </div>
      </div>
    </section>
  );
}
