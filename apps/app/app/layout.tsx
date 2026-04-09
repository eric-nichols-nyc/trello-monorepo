import "./styles.css";
import { DesignSystemProvider } from "@repo/design-system";
import { cn } from "@repo/design-system/lib/utils";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BackendServerAlert } from "@/components/backend-server-alert";
import ReactQueryProvider from "@/queries/hooks/react-query-provider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trellix - Organize Work, Ship Faster",
  description:
    "Trellix helps your team plan projects, track tasks, and collaborate in one clear, visual workspace.",
  openGraph: {
    title: "Trellix - Organize Work, Ship Faster",
    description:
      "Trellix helps your team plan projects, track tasks, and collaborate in one clear, visual workspace.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Trellix workspace preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trellix - Organize Work, Ship Faster",
    description:
      "Trellix helps your team plan projects, track tasks, and collaborate in one clear, visual workspace.",
    images: ["/og-image.png"],
  },
};

type RootLayoutProperties = {
  readonly children: ReactNode;
};

/** UI sans: Atlassian Sans (`styles.css`); monospace: Geist Mono. */
const rootFontClasses = cn(
  GeistMono.variable,
  "touch-manipulation font-sans antialiased"
);

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={rootFontClasses} lang="en" suppressHydrationWarning>
    <body>
      <DesignSystemProvider>
        <ReactQueryProvider>
          <BackendServerAlert />
          {children}
        </ReactQueryProvider>
      </DesignSystemProvider>
    </body>
  </html>
);

export default RootLayout;
