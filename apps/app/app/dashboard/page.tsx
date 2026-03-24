import { Button } from "@repo/design-system/components/ui/button";
import { currentUser } from "@repo/clerk/server";
import Link from "next/link";

const DashboardPage = async () => {
  const user = await currentUser();

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-3xl">Dashboard</h1>
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          {user?.firstName
            ? `Signed in as ${user.firstName}.`
            : "You are signed in."}
        </p>
      </div>
    </main>
  );
};

export default DashboardPage;
