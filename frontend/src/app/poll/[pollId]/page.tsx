"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPoll } from "@/lib/api";
import { Poll } from "@/types/poll";
import { PollDisplay } from "@/components/PollDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PollPage() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pollId) return;

    const fetchPoll = async () => {
      try {
        const response = await getPoll(pollId as string);
        setPoll(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load poll");
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-1000">
        <Loader2 className="h-10 w-10 animate-spin text-stone-400" />
        <p className="font-bold text-stone-500 tracking-wide uppercase text-xs">Preparing your poll...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <Card className="max-w-md w-full shadow-soft card-border p-8 pt-10 text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/5 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-destructive serif">Error</h1>
          <p className="text-muted-foreground font-medium">
            {error || "We couldn't find the poll you're looking for."}
          </p>
        </div>

        <Button asChild variant="secondary" className="w-full h-12 font-bold hover:bg-stone-200 rounded-xl">
          <Link href="/create-poll">Create a New Poll</Link>
        </Button>
      </Card>
    );
  }

  return <PollDisplay initialPoll={poll} />;
}
