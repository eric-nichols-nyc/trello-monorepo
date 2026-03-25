import { Button } from "@repo/design-system/components/ui/button";
import type { ComponentProps } from "react";

type HeaderCreateButtonProperties = ComponentProps<typeof Button>;

export const HeaderCreateButton = ({
  children = "Create",
  type = "button",
  variant = "default",
  ...properties
}: HeaderCreateButtonProperties) => (
  <Button
    data-testid="header-create-button"
    type={type}
    variant={variant}
    {...properties}
  >
    {children}
  </Button>
);
