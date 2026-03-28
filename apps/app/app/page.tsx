import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@repo/clerk/client";

const HomePage = () => (
  <main className="min-h-screen bg-background p-8">
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-4xl">App</h1>
          <p className="mt-2 text-muted-foreground">
            Next.js with @repo/clerk and the design system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <ModeToggle />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/w">
          <Card className="h-full transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </div>
              <CardDescription>
                Protected route — requires a signed-in user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Open workspace
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  </main>
);

export default HomePage;
