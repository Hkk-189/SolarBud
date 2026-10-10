"use client";

import { createContext, useContext, useState } from "react";

interface TimeZone {
  utc: boolean;
  toggle: () => void;
}

const TimeZoneContext = createContext<TimeZone>({ utc: true, toggle: () => {} });

/** One UTC / local choice for every chart on the page. */
export function TimeZoneProvider({ children }: { children: React.ReactNode }) {
  const [utc, setUtc] = useState(true);

  return (
    <TimeZoneContext.Provider value={{ utc, toggle: () => setUtc(!utc) }}>
      {children}
    </TimeZoneContext.Provider>
  );
}

export const useTimeZone = () => useContext(TimeZoneContext);

export function TimeZoneToggle() {
  const { utc, toggle } = useTimeZone();

  return (
    <button
      type="button"
      aria-pressed={utc}
      onClick={toggle}
      className="rounded-card border border-outline px-3 py-1 text-xs font-semibold"
    >
      {utc ? "UTC" : "Local time"}
    </button>
  );
}
