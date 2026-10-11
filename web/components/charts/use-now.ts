"use client";

import { useSyncExternalStore } from "react";

const MINUTE_MS = 60_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, MINUTE_MS);

  return () => clearInterval(id);
}

/** Whole-minute clock, so a forecast can turn old between refetches. 0 on the server render. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, () => Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS, () => 0);
}
