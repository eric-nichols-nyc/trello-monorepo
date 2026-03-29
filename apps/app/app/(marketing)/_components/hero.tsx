/**
 * Primary headline, supporting copy, and main call-to-action above the fold.
 */
export function Hero() {
  return (
    <section className="px-6 py-16">
      <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
        Hero
      </h2>
      <p className="mt-2 max-w-2xl text-foreground leading-relaxed">
        Placeholder for the hero—strong value proposition, short explainer, and
        one or two CTAs (e.g. start free, watch demo). Sets tone for the rest
        of the page.
      </p>
    </section>
  );
}
