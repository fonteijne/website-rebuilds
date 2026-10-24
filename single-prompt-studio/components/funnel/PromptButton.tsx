"use client";

import type { ReactNode } from "react";
import { requestPrompt } from "@/lib/prefill";

/** Knop die naar het promptveld springt, optioneel met een startzin. Zonder JS: gewoon een anker. */
export default function PromptButton({
  starter,
  children,
  className = "",
}: {
  starter?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href="#prompt"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        requestPrompt(starter);
      }}
    >
      {children}
    </a>
  );
}
