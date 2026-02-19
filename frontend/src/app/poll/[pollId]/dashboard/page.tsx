import { getPoll } from "@/lib/api";
import { DashboardClient } from "@/components/DashboardClient";

interface PageProps {
  params: Promise<{
    pollId: string;
  }>;
}

export default async function PollDashboardPage({ params }: PageProps) {
  const { pollId } = await params;
  const poll = await getPoll(pollId);

  return <DashboardClient initialPoll={poll.data} />;
}
