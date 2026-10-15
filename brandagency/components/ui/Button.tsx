import type { ReactNode } from "react";
import TLink from "@/components/TLink";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "pink" | "blue" | "ghost";
  size?: "md" | "lg";
  external?: boolean;
  className?: string;
};

const variants = {
  pink: "bg-pink text-white",
  blue: "bg-blue text-white",
  ghost: "border border-white/25 text-paper hover:border-pink",
};

/** Knop met een tekst-roll bij hover (tekst schuift omhoog, kopie komt van onder). */
export default function Button({ href, children, variant = "pink", size = "md", external, className = "" }: Props) {
  const cls = `group relative inline-flex items-center gap-3 overflow-hidden rounded-full font-bold uppercase tracking-[0.18em] transition-transform duration-300 active:scale-95 ${
    size === "lg" ? "px-9 py-5 text-sm" : "px-6 py-3.5 text-xs"
  } ${variants[variant]} ${className}`;

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-white transition-transform duration-500 ease-out-expo group-hover:scale-y-100"
      />
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
        <span
          aria-hidden="true"
          className="absolute inset-0 block translate-y-full text-black transition-transform duration-500 ease-out-expo group-hover:translate-y-0"
        >
          {children}
        </span>
      </span>
      <svg
        viewBox="0 0 24 24"
        className="relative size-4 transition-all duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-black"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </>
  );

  if (external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inner}
      </a>
    );
  }
  return (
    <TLink href={href} className={cls}>
      {inner}
    </TLink>
  );
}

/** Tekstlink met »-pijlen zoals op de originele site ("Meer informatie"). */
export function ArrowLink({ href, children, accent = "pink" }: { href: string; children: ReactNode; accent?: "pink" | "blue" }) {
  return (
    <TLink
      href={href}
      className="group inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.15em] text-paper"
    >
      <span
        aria-hidden="true"
        className={`text-lg leading-none transition-transform duration-300 group-hover:translate-x-1.5 ${
          accent === "pink" ? "text-pink" : "text-blue"
        }`}
      >
        »
      </span>
      <span className="link-underline">{children}</span>
    </TLink>
  );
}
