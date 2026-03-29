type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "App transformed how our engineering team ships products. We cut our sprint planning time in half.",
    author: "Sarah Chen",
    role: "VP of Engineering",
    company: "TechCorp",
    avatar: "SC",
  },
  {
    quote:
      "The best project management tool we've used. Simple enough for new hires, powerful enough for complex workflows.",
    author: "Marcus Johnson",
    role: "Operations Director",
    company: "ScaleUp Inc",
    avatar: "MJ",
  },
  {
    quote:
      "We manage 50+ client projects in App. The visibility and collaboration features are unmatched.",
    author: "Emily Rodriguez",
    role: "Agency Owner",
    company: "Creative Studio",
    avatar: "ER",
  },
];

/** Customer quotes in a three-column grid. */
export function Testimonials() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
            Testimonials
          </p>
          <h2 className="mt-4 text-balance font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            Loved by teams everywhere
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              className="flex flex-col rounded-xl border border-border bg-card p-6"
              key={testimonial.author}
            >
              <p className="flex-1 text-muted-foreground leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium text-foreground text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {testimonial.author}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
