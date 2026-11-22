"use client";

import { useMemo } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import { useDashboard } from "@/hooks/useDashboard";
import { useData } from "@/hooks/useData";
import { useDirectSimulation } from "@/hooks/useDirectSimulation";
import { useReturningGuests } from "@/hooks/useReturningGuests";
import { useWinterCampaign } from "@/hooks/useWinterCampaign";
import { gainScenarios } from "@/lib/kpi";
import {
  buildPainel,
  PAINEL_DIRECT,
  PAINEL_WINTER_CAMPAIGN,
} from "@/lib/painel";
import type { PainelView } from "@/types";

/** Every text of the single page, for the selected month; null until the data is ready. */
export function usePainel(): PainelView | null {
  const { bookings, status } = useData();
  const dashboard = useDashboard();
  const returning = useReturningGuests();
  const alerts = useAlerts();
  const campaign = useWinterCampaign(PAINEL_WINTER_CAMPAIGN);
  const direct = useDirectSimulation(PAINEL_DIRECT);

  const gains = useMemo(
    () => (status === "ready" ? gainScenarios(bookings) : null),
    [bookings, status],
  );

  return useMemo(() => {
    if (!dashboard || !returning || !alerts || !campaign || !direct || !gains)
      return null;
    return buildPainel({
      year: dashboard.year,
      byMonth: dashboard.byMonth,
      thermometer: dashboard.thermometer,
      totals: returning.totals,
      facts: alerts.facts,
      alerts: alerts.alerts,
      month: alerts.month,
      winterReturners: returning.winterReturners,
      contactFirst: returning.contactFirst,
      campaign,
      direct,
      gains,
    });
  }, [dashboard, returning, alerts, campaign, direct, gains]);
}
