"use client";

import { useEffect, useState } from "react";
import Noise from "./Noise";

/** Filmkorrel over de hele site — alleen op desktop, om mobiele GPU's te sparen. */
export default function NoiseLayer() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setOn(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  if (!on) return null;
  return <Noise fixed opacity={0.06} fps={12} blendMode="overlay" zIndex={95} />;
}
