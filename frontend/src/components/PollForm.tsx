"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Trash2 } from "lucide-react";
import { createPoll } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { GeneratedPoll } from "@/types/poll";

export interface PollFormProps {
  /** Prefilled question and options (e.g. from AI generation). Form resets when this changes. */
  prefilled?: GeneratedPoll | null;
}

export function PollForm({ prefilled }: PollFormProps) {
  const [question, setQuestion] = useState(prefilled?.question ?? "");
  const [options, setOptions] = useState(
    prefilled?.options?.length ? prefilled.options : ["", ""]
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
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
    setErrors([]);
    const newErrors: string[] = [];

    if (!question.trim()) {
      newErrors.push("Question is required");
    } else if (question.length < 5) {
      newErrors.push("Question must be at least 5 characters");
    }

    const filteredOptions = options.map(o => o.trim()).filter(o => o !== "");
    if (filteredOptions.length < 2) {
      newErrors.push("At least 2 non-empty options are required");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await createPoll({ question, options: filteredOptions });
      router.push(`/poll/${response.data.id}`);
    } catch (err: any) {
        if (err.details && Array.isArray(err.details)) {
            // Handle Pydantic validation errors
            setErrors(err.details.map((e: any) => e.msg));
        } else if (err.details && typeof err.details === 'string') {
             setErrors([err.details]);
        } else {
            setErrors([err.message || "Something went wrong"]);
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Create a live poll
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Share it anywhere and see live results update automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-foreground">Question</label>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
              {question.length}/500
            </span>
          </div>
          <Input
            placeholder="What should we build next?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            maxLength={500}
            className="rounded-xl bg-white/80 border-border h-12 text-base px-4 shadow-sm focus:ring-2 focus:ring-stone-400/40 focus:border-stone-400 transition-shadow"
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
                  className="rounded-xl bg-white/80 border-border h-11 text-base px-4 flex-1 shadow-sm focus:ring-2 focus:ring-stone-400/40 focus:border-stone-400 transition-shadow"
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleRemoveOption(index)}
                    disabled={loading}
                    className="h-11 px-5 font-medium rounded-xl text-stone-600 hover:bg-stone-200/80 border border-border"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddOption}
            disabled={loading}
            className="h-12 px-6 font-semibold rounded-xl text-stone-700 hover:bg-stone-200/80 border border-border"
          >
            Add option
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-8 font-semibold rounded-xl bg-gradient-to-b from-stone-800 to-stone-900 text-white shadow-md hover:shadow-lg hover:from-stone-900 hover:to-stone-950 transition-all"
          >
            {loading ? "Creating..." : "Create poll"}
          </Button>
        </div>

        {errors.length > 0 && (
          <div className="text-sm font-medium text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20 animate-in fade-in slide-in-from-top-1">
            {errors.length === 1 ? (
                <p>{errors[0]}</p>
            ) : (
                <ul className="list-disc list-inside space-y-1">
                    {errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                    ))}
                </ul>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
