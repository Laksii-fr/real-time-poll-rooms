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
    <div className="w-full max-w-5xl mx-auto min-h-screen flex flex-col items-center pt-6 md:pt-10 pb-16 px-4">
      {/* Hero: gradient title + tagline */}
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-gradient-hero tracking-tight mb-3">
          CrowdSnap
        </h1>
        <p className="text-stone-500 text-lg md:text-xl font-medium max-w-md mx-auto">
          Live polls in seconds. Create, share, see results—instantly.
        </p>
      </header>

      <Card className="w-full shadow-hero card-border rounded-2xl p-8 pt-6 overflow-hidden bg-card/95 backdrop-blur-sm">
        {/* Tabs: pill-style with clear active state */}
        <div className="flex gap-1 p-1 rounded-xl bg-stone-100/80 border border-border/60 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200",
              activeTab === "manual"
                ? "bg-white text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            )}
          >
            <Pencil className="h-4 w-4" />
            Create poll manually
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200",
              activeTab === "ai"
                ? "bg-white text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            )}
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
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
                className="min-h-[88px] w-full flex-1 rounded-xl border border-input bg-white/80 px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400/50 disabled:opacity-50 resize-y transition-shadow"
              />
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="self-end h-11 px-6 font-semibold rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all"
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
      <section className="w-full mt-10 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-gradient-hero mb-3">
          Why CrowdSnap?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-16 text-base md:text-lg">
          Create, share, and vote on polls with live results. Perfect for meetings, events, and quick feedback.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mb-24">
          {FEATURES.map(({ icon: Icon, title, description }, idx) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm hover-lift overflow-hidden group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                    idx === 1
                      ? "bg-amber-100 text-amber-700"
                      : "bg-stone-100 text-stone-700"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-0">
                {description}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl md:text-4xl font-bold text-gradient-hero mb-3">
          How it works
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-14 text-base">
          Three steps from idea to live results.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {STEPS.map(({ step, title, body }, i) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 text-white font-bold text-xl mb-5 shadow-lg">
                {step}
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground max-w-[200px]">{body}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-2 top-7 h-6 w-6 text-stone-300" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
