import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an account",
};

export default function SignUpLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
