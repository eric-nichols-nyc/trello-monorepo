import { CheckCircle2 } from "lucide-react";

const workflowBullets = [
  "Create boards for projects, teams, or goals",
  "Add lists to organize tasks by status or stage",
  "Invite teammates and assign work instantly",
  "Track progress with built-in analytics",
] as const;

function BoardPreview({
  name,
  tasks,
  complete,
}: {
  name: string;
  tasks: number;
  complete: number;
}) {
  const percentage = Math.round((complete / tasks) * 100);

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent">
      <p className="font-medium text-foreground text-sm">{name}</p>
      <div className="mt-3">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>
            {complete}/{tasks} tasks
          </span>
          <span>{percentage}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/** Workflow story + illustrative board previews (#solutions). */
export function Workflow() {
  return (
    <section
      className="border-border border-t bg-card py-20 md:py-32"
      id="solutions"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
              Workflow
            </p>
            <h2 className="mt-4 text-balance font-bold text-3xl text-foreground tracking-tight md:text-4xl">
              From chaos to clarity in minutes
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground leading-relaxed">
              Set up your workspace in minutes, not days. App adapts to how your
              team already works.
            </p>

            <ul className="mt-8 flex flex-col gap-4">
              {workflowBullets.map((item) => (
                <li className="flex items-start gap-3" key={item}>
                  <CheckCircle2
                    aria-hidden
                    className="mt-0.5 h-5 w-5 shrink-0 text-green-500"
                  />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-border bg-background p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div>
                  <p className="font-medium text-foreground">Marketing Team</p>
                  <p className="text-muted-foreground text-sm">12 members</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <BoardPreview complete={18} name="Q1 Campaigns" tasks={24} />
                <BoardPreview
                  complete={42}
                  name="Content Calendar"
                  tasks={56}
                />
                <BoardPreview complete={12} name="Brand Assets" tasks={12} />
                <BoardPreview complete={8} name="Launch Plan" tasks={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
