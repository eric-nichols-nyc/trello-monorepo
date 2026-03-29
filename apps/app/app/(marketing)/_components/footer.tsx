import { Github, LayoutGrid, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Product: ["Features", "Integrations", "Pricing", "Changelog", "Roadmap"],
  Resources: ["Help Center", "Guides", "API Docs", "Community", "Templates"],
  Company: ["About", "Blog", "Careers", "Press", "Contact"],
  Legal: ["Privacy", "Terms", "Security", "Cookies"],
} as const;

const footerCategories = [
  "Product",
  "Resources",
  "Company",
  "Legal",
] as const satisfies readonly (keyof typeof footerLinks)[];

const linkClass =
  "text-muted-foreground text-sm transition-colors hover:text-foreground";

/** Site footer: brand blurb, link columns, copyright, social (#resources). */
export function Footer() {
  return (
    <footer className="border-border border-t bg-background" id="resources">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link
              aria-label="App home"
              className="flex items-center gap-2"
              href="/"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <LayoutGrid
                  aria-hidden
                  className="h-5 w-5 text-primary-foreground"
                  strokeWidth={2}
                />
              </div>
              <span className="font-semibold text-foreground text-xl">App</span>
            </Link>
            <p className="mt-4 max-w-xs text-muted-foreground text-sm leading-relaxed">
              The visual project management platform that helps teams organize
              work and ship faster.
            </p>
          </div>

          {footerCategories.map((category) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground text-sm">
                {category}
              </h4>
              <ul className="mt-4 flex flex-col gap-2">
                {footerLinks[category].map((link) => (
                  <li key={link}>
                    <Link className={linkClass} href="#">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-border border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            &copy; 2026 App. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              aria-label="Twitter"
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="#"
            >
              <Twitter aria-hidden className="h-5 w-5" />
            </Link>
            <Link
              aria-label="GitHub"
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="#"
            >
              <Github aria-hidden className="h-5 w-5" />
            </Link>
            <Link
              aria-label="LinkedIn"
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="#"
            >
              <Linkedin aria-hidden className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
