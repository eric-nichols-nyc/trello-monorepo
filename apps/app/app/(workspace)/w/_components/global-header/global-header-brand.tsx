import Link from "next/link";
import { BrandWordmark } from "@/app/(marketing)/_components/brand-wordmark";

type GlobalHeaderBrandProps = {
  readonly title?: string;
};

export function GlobalHeaderBrand({
  title = "Dashboard",
}: GlobalHeaderBrandProps) {
  return (
    <div className="flex min-w-0 shrink-0">
      <Link
        aria-label={`${title} — workspace home`}
        className="flex shrink-0 items-center gap-2 rounded-md no-underline outline-offset-2 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        href="/w"
      >
        <BrandWordmark />
      </Link>
    </div>
  );
}
