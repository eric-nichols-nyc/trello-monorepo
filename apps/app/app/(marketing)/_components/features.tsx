import {
  Eye,
  Layers,
  Lock,
  type LucideIcon,
  Plug,
  Users,
  Zap,
} from "lucide-react";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  {
    icon: Layers,
    title: "Visual Boards",
    description:
      "Organize tasks with drag-and-drop boards. Create lists, add cards, and move work through stages effortlessly.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Work together with your team in real-time. See updates instantly, comment on tasks, and stay aligned.",
  },
  {
    icon: Zap,
    title: "Automation",
    description:
      "Automate repetitive tasks with powerful rules. Move cards, assign team members, and trigger actions automatically.",
  },
  {
    icon: Eye,
    title: "Multiple Views",
    description:
      "Switch between board, timeline, calendar, and table views. See your work the way that makes sense for you.",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Bank-grade security with SSO, 2FA, and advanced permissions. Your data is encrypted at rest and in transit.",
  },
  {
    icon: Plug,
    title: "Integrations",
    description:
      "Connect with 200+ apps including Slack, GitHub, Jira, and more. Your tools, unified in one workspace.",
  },
];

/** Feature grid with icons, titles, and descriptions. */
export function Features() {
  return (
    <section className="py-20 md:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
            Features
          </p>
          <h2 className="mt-4 text-balance font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            Everything you need to manage projects
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            From simple to-do lists to complex workflows, App scales with your
            team.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-muted-foreground/30 hover:bg-accent"
              key={title}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Icon aria-hidden className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground text-lg">
                {title}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
