"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Plus, Trash2 } from "lucide-react";
import { createPoll } from "@/lib/api";
import { useRouter } from "next/navigation";

export function PollForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddOption = () => setOptions([...options, ""]);
  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!question.trim()) {
      setError("Question is required");
      return;
    }

    const filteredOptions = options.map(o => o.trim()).filter(o => o !== "");
    if (filteredOptions.length < 2) {
      setError("At least 2 non-empty options are required");
      return;
    }

    setLoading(true);
    try {
      const response = await createPoll({ question, options: filteredOptions });
      router.push(`/poll/${response.data.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-stone-900 mb-6 pl-1">CrowdSnap</h2>
      <Card className="w-full shadow-soft card-border p-8 pt-10">
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create a live poll</h1>
          <p className="text-muted-foreground">
            Share it anywhere and see live results update automatically.
          </p>
        </div>


      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-foreground">Question</label>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
              {question.length}/200
            </span>
          </div>
          <Input
            placeholder="What should we build next?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            maxLength={200}
            className="bg-white border-border h-12 text-base px-4 focus:ring-1 focus:ring-foreground focus:border-foreground"
          />
        </div>

        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-foreground">Option {index + 1}</label>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                  {option.length}/200
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <Input
                  placeholder="Enter an option"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  disabled={loading}
                  maxLength={200}
                  className="bg-white border-border h-11 text-base px-4 flex-1 focus:ring-1 focus:ring-foreground focus:border-foreground"
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleRemoveOption(index)}
                    disabled={loading}
                    className="h-11 px-5 font-medium text-stone-600 hover:bg-stone-200"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddOption}
            disabled={loading}
            className="h-12 px-6 font-semibold text-stone-700 hover:bg-stone-200"
          >
            Add option
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="h-12 px-8 font-semibold bg-primary text-primary-foreground hover:bg-stone-800 rounded-xl"
          >
            {loading ? "Creating..." : "Create poll"}
          </Button>
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/10 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </form>
      </Card>
    </div>
  );
}
