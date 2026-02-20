"use client";

import { ChevronDown } from "lucide-react";

/**
 * A subtle visual cue that there is more content below. No text—just an animated indicator.
 */
export function ScrollHint() {
  return (
    <div className="flex flex-col items-center justify-center py-8" aria-hidden>
      <div className="flex flex-col items-center gap-0.5 text-stone-400">
        <ChevronDown className="h-7 w-7 animate-bounce drop-shadow-sm" strokeWidth={2.5} />
        <ChevronDown className="h-5 w-5 animate-bounce opacity-80 [animation-delay:0.15s]" strokeWidth={2.5} />
        <ChevronDown className="h-3 w-3 animate-bounce opacity-60 [animation-delay:0.3s]" strokeWidth={2.5} />
      </div>
      <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
    </div>
  );
}
