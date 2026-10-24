"use client";

/** Andere secties (diensten, slot-CTA) vragen het promptveld om te vullen en in beeld te komen. */
export const PREFILL_EVENT = "sps:prefill";
export type PrefillDetail = { starter?: string };

export function requestPrompt(starter?: string) {
  window.dispatchEvent(new CustomEvent<PrefillDetail>(PREFILL_EVENT, { detail: { starter } }));
}
