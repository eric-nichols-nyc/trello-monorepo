import "./styles.css";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import type { ReactNode } from "react";
import { BackendServerAlert } from "@/components/backend-server-alert";
import Providers from "@/tanstack/provider";

export const dynamic = "force-dynamic";

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={fonts} lang="en" suppressHydrationWarning>
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
