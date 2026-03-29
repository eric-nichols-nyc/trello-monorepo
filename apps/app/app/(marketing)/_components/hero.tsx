"use client";

import { SignUpButton } from "@repo/clerk/client";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

function Column({
  title,
  count,
  color,
  children,
}: {
  title: string;
  count: number;
  color: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-lg p-3", color)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-foreground text-sm">{title}</span>
        <span className="text-muted-foreground text-xs">{count}</span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function TaskCard({
  title,
  tag,
  tagColor,
  priority,
  done,
}: {
  title: string;
  tag: string;
  tagColor: string;
  priority?: boolean;
  done?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-2.5 transition-transform hover:scale-[1.02]",
        done === true && "opacity-60"
      )}
    >
      <p
        className={cn(
          "font-medium text-foreground text-xs",
          done === true && "line-through"
        )}
      >
        {title}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-medium text-[10px]",
            tagColor
          )}
        >
          {tag}
        </span>
        {priority === true ? (
          <span className="text-[10px] text-orange-400">High</span>
        ) : null}
      </div>
    </div>
  );
}

/** Above-the-fold headline, CTAs, and illustrative board preview. */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-2xl">
            <h1 className="text-balance font-bold text-4xl text-foreground leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Organize work.{" "}
              <span className="text-muted-foreground">Ship faster.</span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground leading-relaxed md:text-xl">
              The visual project management platform that helps teams turn ideas
              into action. Drag, drop, and deliver with boards that flex to your
              workflow.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <SignUpButton mode="modal">
                <Button className="gap-2" size="lg">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </SignUpButton>
              <Button size="lg" type="button" variant="outline">
                Watch demo
              </Button>
            </div>
            <p className="mt-6 text-muted-foreground text-sm">
              Free forever for individuals. No credit card required.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-border bg-card p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="text-muted-foreground text-sm">
                  Product Launch Board
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Column color="bg-muted" count={4} title="To Do">
                  <TaskCard
                    tag="Research"
                    tagColor="bg-blue-500/20 text-blue-400"
                    title="User research"
                  />
                  <TaskCard
                    tag="Design"
                    tagColor="bg-pink-500/20 text-pink-400"
                    title="Wireframe designs"
                  />
                  <TaskCard
                    tag="Dev"
                    tagColor="bg-green-500/20 text-green-400"
                    title="API documentation"
                  />
                </Column>
                <Column color="bg-muted" count={3} title="In Progress">
                  <TaskCard
                    priority
                    tag="Design"
                    tagColor="bg-pink-500/20 text-pink-400"
                    title="Dashboard UI"
                  />
                  <TaskCard
                    tag="Dev"
                    tagColor="bg-green-500/20 text-green-400"
                    title="Auth system"
                  />
                </Column>
                <Column color="bg-muted" count={6} title="Done">
                  <TaskCard
                    done
                    tag="Design"
                    tagColor="bg-pink-500/20 text-pink-400"
                    title="Brand guidelines"
                  />
                  <TaskCard
                    done
                    tag="Dev"
                    tagColor="bg-green-500/20 text-green-400"
                    title="Database schema"
                  />
                </Column>
              </div>
            </div>

            <div className="-z-10 -bottom-4 -left-4 absolute h-full w-full rounded-xl bg-border/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
