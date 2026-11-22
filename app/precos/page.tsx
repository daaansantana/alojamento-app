"use client";

import { useState } from "react";
import {
  type Question,
  Simular,
  type SliderRange,
} from "@/components/painel/simular";
import { useData } from "@/hooks/useData";
import { useDirectSimulation } from "@/hooks/useDirectSimulation";
import { usePricing } from "@/hooks/usePricing";
import { useWinterCampaign } from "@/hooks/useWinterCampaign";
import {
  PAINEL_DIRECT,
  PAINEL_SUMMER,
  PAINEL_WINTER_CAMPAIGN,
} from "@/lib/painel";
import { ScreenState } from "../screen-state";

const INITIAL: Record<Question, number> = {
  summer: Math.round(PAINEL_SUMMER.priceChange * 100),
  winter: Math.round(PAINEL_WINTER_CAMPAIGN.returnRate * 100),
  direct: Math.round(PAINEL_DIRECT.conversionRate * 100),
};
const RANGES: Record<Question, SliderRange> = {
  summer: { min: 0, max: 20, step: 5 },
  winter: { min: 0, max: 50, step: 5 },
  direct: { min: 0, max: 100, step: 10 },
};

/** Preços: «O meu preço está bem?» */
export default function Precos() {
  const { status, retry } = useData();
  const [question, setQuestion] = useState<Question>("summer");
  const [values, setValues] = useState(INITIAL);
  const pricing = usePricing({
    priceChange: values.summer / 100,
    months: PAINEL_SUMMER.months,
  });
  const winter = useWinterCampaign({
    returnRate: values.winter / 100,
    discount: PAINEL_WINTER_CAMPAIGN.discount,
  });
  const direct = useDirectSimulation({
    ...PAINEL_DIRECT,
    conversionRate: values.direct / 100,
  });
  if (!pricing)
    return <ScreenState failed={status === "error"} onRetry={retry} />;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h1 font-bold lg:text-h1-lg">
        O seu preço e o do mercado
      </h1>
      <Simular
        question={question}
        onQuestionChange={setQuestion}
        values={values}
        onValueChange={(q, value) =>
          setValues((current) => ({ ...current, [q]: value }))
        }
        ranges={RANGES}
        onReset={() => setValues(INITIAL)}
        discounts={{
          winter: PAINEL_WINTER_CAMPAIGN.discount,
          direct: PAINEL_DIRECT.directDiscount,
        }}
        pricing={pricing}
        winter={winter}
        direct={direct}
      />
    </div>
  );
}
