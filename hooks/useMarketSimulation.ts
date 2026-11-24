"use client";

import { useEffect, useState } from "react";
import { fetchMarketSimulation } from "@/services/data";
import type { MarketSimulation } from "@/types/mercado";

/** The simulated market file, loaded once by the page that shows it. */
export function useMarketSimulation(): {
  sim: MarketSimulation | null;
  status: "loading" | "ready" | "error";
} {
  const [sim, setSim] = useState<MarketSimulation | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  useEffect(() => {
    let live = true;
    fetchMarketSimulation()
      .then((data) => {
        if (!live) return;
        setSim(data);
        setStatus("ready");
      })
      .catch(() => {
        if (live) setStatus("error");
      });
    return () => {
      live = false;
    };
  }, []);
  return { sim, status };
}
