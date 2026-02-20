import { getPoll } from "@/lib/api";
import { DashboardClient } from "@/components/DashboardClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    pollId: string;
  }>;
}

export default async function PollDashboardPage({ params }: PageProps) {
  const { pollId } = await params;

  let poll;
  try {
    const res = await getPoll(pollId);
    poll = res.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load poll";
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive font-medium text-center max-w-md">{message}</p>
        <p className="text-sm text-muted-foreground text-center">
          Make sure the backend is running and reachable at the API URL.
        </p>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/poll/${pollId}`}>View poll</Link>
          </Button>
          <Button asChild>
            <Link href="/create-poll">Create a poll</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <DashboardClient initialPoll={poll} />;
}
