"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TimeZoneProvider } from "@/components/charts/time-zone";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <TimeZoneProvider>{children}</TimeZoneProvider>
    </QueryClientProvider>
  );
}
