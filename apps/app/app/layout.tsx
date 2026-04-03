import "./styles.css";
import { DesignSystemProvider } from "@repo/design-system";
import { cn } from "@repo/design-system/lib/utils";
import { GeistMono } from "geist/font/mono";
import type { ReactNode } from "react";
import { BackendServerAlert } from "@/components/backend-server-alert";
import Providers from "@/tanstack/provider";

export const dynamic = "force-dynamic";

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
        <Providers>
          <BackendServerAlert />
          {children}
        </Providers>
      </DesignSystemProvider>
    </body>
  </html>
);

export default RootLayout;
