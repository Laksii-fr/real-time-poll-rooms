"use client";

import { useState } from "react";
import { PollForm } from "@/components/PollForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generatePoll } from "@/lib/api";
import type { GeneratedPoll } from "@/types/poll";
import {
  Sparkles,
  Pencil,
  Zap,
  Link2,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollHint } from "@/components/ScrollHint";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time results",
    description:
      "See votes update instantly as people respond. No refresh needed—WebSockets keep everyone in sync.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted creation",
    description:
      "Describe your topic in plain text and get a suggested question and options. Edit and publish in seconds.",
  },
  {
    icon: Link2,
    title: "Instant sharing",
    description:
      "Get a unique, shareable link the moment you create a poll. Share anywhere—meetings, chat, or social.",
  },
  {
    icon: ShieldCheck,
    title: "Fair voting",
    description:
      "Cookie and IP-based safeguards help prevent duplicate votes so results stay honest.",
  },
  {
    icon: BarChart3,
    title: "Live dashboard",
    description:
      "Creators get a dedicated dashboard to watch results roll in as votes are cast.",
  },
  {
    icon: MessageSquare,
    title: "Simple & focused",
    description:
      "One question, multiple options. No sign-up required to vote—just open the link and choose.",
  },
];

const STEPS = [
  { step: 1, title: "Create your poll", body: "Add a question and options, or let AI suggest them from a topic." },
  { step: 2, title: "Share the link", body: "Send the unique link to your audience—anywhere you like." },
  { step: 3, title: "See results live", body: "Watch votes and results update in real time for you and voters." },
];

type TabId = "manual" | "ai";

export default function CreatePollPage() {
  const [activeTab, setActiveTab] = useState<TabId>("manual");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState<GeneratedPoll | null>(null);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (trimmed.length < 3) {
      setGenerateError("Enter at least 3 characters to generate a poll.");
      return;
    }
    setGenerateError(null);
    setGenerating(true);
    try {
      const { data } = await generatePoll(trimmed);
      setPrefilled({ question: data.question, options: data.options });
    } catch (err: any) {
      setGenerateError(err.message || "Failed to generate poll. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen flex flex-col items-center pt-8 pb-12 px-4">
      {/* Single centered title at top - larger */}
      <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 text-center mb-10">
        CrowdSnap
      </h1>

      <Card className="w-full shadow-soft card-border p-8 pt-6 overflow-hidden">
        {/* Tabs on the card only */}
        <div className="flex border-b border-border mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px",
              activeTab === "manual"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Pencil className="h-4 w-4" />
            Create poll manually
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px",
              activeTab === "ai"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Generate using AI
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "manual" && (
          <PollForm
            key="manual"
            prefilled={null}
          />
        )}

        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Generate poll with AI
              </h3>
              <p className="text-sm text-muted-foreground">
                Describe your topic or idea in a few words. We&apos;ll suggest a question and options you can edit below before creating the poll.
              </p>
            </div>
            <div className="flex gap-3">
              <textarea
                placeholder="e.g. Team lunch preferences, best meeting time, favorite project idea..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={generating}
                maxLength={1000}
                className="min-h-[80px] w-full flex-1 rounded-md border border-input bg-white px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y"
              />
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="self-end h-11 px-6 font-semibold bg-amber-600 hover:bg-amber-700 text-white"
              >
                {generating ? "Generating…" : "Generate"}
              </Button>
            </div>
            {generateError && (
              <p className="text-sm text-destructive">{generateError}</p>
            )}
            {prefilled && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Edit the suggested question and options below, then click Create poll.
                </p>
                <PollForm
                  key={prefilled ? `gen-${prefilled.question}-${prefilled.options.join(",")}` : "ai-empty"}
                  prefilled={prefilled}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Gap so hero and landing content are clearly separated */}
      <div className="w-full h-24 md:h-32 shrink-0" />

      {/* Scroll-hint component: visual cue that more content is below */}
      <ScrollHint />

      {/* Landing-style content below the poll */}
      <section className="w-full mt-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
          Why CrowdSnap?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-14">
          Create, share, and vote on polls with live results. Perfect for meetings, events, and quick feedback.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mb-20">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
          How it works
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-12">
          Three steps from idea to live results.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STEPS.map(({ step, title, body }, i) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white font-bold text-lg mb-4">
                {step}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-4 top-6 h-5 w-5 text-stone-300" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
