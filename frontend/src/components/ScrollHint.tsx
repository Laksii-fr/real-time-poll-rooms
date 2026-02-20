"use client";

import { ChevronDown } from "lucide-react";

/**
 * A subtle visual cue that there is more content below. No text—just an animated indicator.
 */
export function ScrollHint() {
  return (
    <div className="flex flex-col items-center justify-center py-8" aria-hidden>
      <div className="flex flex-col items-center gap-1 text-stone-400">
        <ChevronDown className="h-8 w-8 animate-bounce" strokeWidth={2} />
        <ChevronDown className="h-6 w-6 animate-bounce [animation-delay:0.1s]" strokeWidth={2} />
        <ChevronDown className="h-4 w-4 animate-bounce [animation-delay:0.2s]" strokeWidth={2} />
      </div>
    </div>
  );
}
