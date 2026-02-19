"use client";

import { useState, useEffect } from "react";
import { Poll, Option } from "@/types/poll";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { castVote, getWebSocketResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CheckCircle2, Share2, Copy, Check, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface PollDisplayProps {
  initialPoll: Poll;
}

export function PollDisplay({ initialPoll }: PollDisplayProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ws = getWebSocketResponse(poll.id);

    ws.onmessage = (event) => {
      try {
        const result = JSON.parse(event.data);
        // Handle both raw poll objects and ApiResponse wrapped objects
        const updatedPoll = result.data || result;
        if (updatedPoll && updatedPoll.options) {
          setPoll(updatedPoll);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    ws.onerror = () => {
      console.warn("WebSocket connection error");
    };

    return () => ws.close();
  }, [poll.id]);

  const handleVote = async () => {
    if (!selectedOption) return;
    setLoading(true);
    setError(null);
    try {
      await castVote(poll.id, selectedOption);
      setVoted(true);
    } catch (err: any) {
      setError(err.message);
      if (err.message === "You have already voted.") {
        setVoted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalVotes = (poll.options || []).reduce((sum, opt) => sum + opt.vote_count, 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      <h2 className="text-3xl font-serif font-bold text-stone-900 pl-1">CrowdSnap</h2>
      <Card className="w-full shadow-soft card-border p-8 pt-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1 md:pr-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground lowercase">{poll.question}</h1>
            <p className="text-muted-foreground">
              {voted ? "Real-time results are updating automatically." : "Cast your vote below to see the current results."}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row md:shrink-0">
            <Button 
              variant="secondary" 
              onClick={handleCopyLink} 
              title="Copy shareable link" 
              className="h-12 gap-2 rounded-xl px-5 font-bold transition-all hover:bg-stone-200"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>Copy link</span>
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              asChild
              className="h-12 gap-2 rounded-xl border-stone-200 px-5 font-bold transition-all hover:bg-stone-50"
            >
              <Link href={`/poll/${poll.id}/dashboard`}>
                <LayoutDashboard className="h-4 w-4" />
                <span>Poll Analytics</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {!voted ? (
            <div className="space-y-3">
              {(poll.options || []).map((option) => (
                <Button
                  key={option.id}
                  variant={selectedOption === option.id ? "default" : "outline"}
                  className={cn(
                    "w-full justify-start h-14 px-6 text-left text-base font-semibold rounded-xl border transition-all",
                    selectedOption === option.id 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-white border-border hover:bg-muted text-foreground"
                  )}
                  onClick={() => setSelectedOption(option.id)}
                  disabled={loading}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {(poll.options || []).map((option) => {
                const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
                const isSelected = selectedOption === option.id;
                
                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-bold text-base flex items-center gap-2">
                        {option.text}
                        {isSelected && <Badge variant="secondary" className="font-bold px-2 py-0">You</Badge>}
                      </span>
                      <span className="text-stone-500 font-bold text-sm">
                        {option.vote_count} {option.vote_count === 1 ? 'vote' : 'votes'} • {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-100">
                      <div 
                        className="h-full bg-accent transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-6 border-t border-muted flex justify-between items-center text-muted-foreground text-sm font-semibold">
                <span>TOTAL VOTES</span>
                <span>{totalVotes}</span>
              </div>
            </div>
          )}
          
          {error && <p className="text-sm font-bold text-destructive bg-destructive/5 p-4 rounded-xl border border-destructive/10">{error}</p>}
          
          {!voted && (
            <div className="pt-4">
              <Button
                className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-stone-800 rounded-xl shadow-lg"
                size="lg"
                disabled={!selectedOption || loading}
                onClick={handleVote}
              >
                {loading ? "Casting vote..." : "Submit vote"}
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {voted && !error && (
        <div className="flex items-center justify-center gap-2 text-stone-500 font-bold animate-in fade-in slide-in-from-top-2 duration-1000">
          <CheckCircle2 className="h-5 w-5" />
          Your vote has been counted
        </div>
      )}
    </div>
  );
}
