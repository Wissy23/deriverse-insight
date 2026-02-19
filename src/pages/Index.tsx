import { useState, useMemo } from "react";
import { mockTrades } from "@/data/mockTrades";
import { Header } from "@/components/dashboard/Header";
import { KPITiles } from "@/components/dashboard/KPITiles";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { DirectionalBias } from "@/components/dashboard/DirectionalBias";
import { TimeAnalysis } from "@/components/dashboard/TimeAnalysis";
import { TradeJournal } from "@/components/dashboard/TradeJournal";
import { OrderTypeEfficiency } from "@/components/dashboard/OrderTypeEfficiency";
import { FeeComposition } from "@/components/dashboard/FeeComposition";

type DateRange = "24h" | "7d" | "30d" | "all";

const Index = () => {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  const filteredTrades = useMemo(() => {
    let trades = mockTrades;

    if (selectedSymbols.length > 0) {
      trades = trades.filter((t) => selectedSymbols.includes(t.asset));
    }

    if (dateRange !== "all") {
      const now = new Date(Math.max(...mockTrades.map((t) => new Date(t.exitTime).getTime())));
      const ms = { "24h": 86400000, "7d": 604800000, "30d": 2592000000 }[dateRange];
      const cutoff = new Date(now.getTime() - ms);
      trades = trades.filter((t) => new Date(t.exitTime) >= cutoff);
    }

    return trades;
  }, [dateRange, selectedSymbols]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedSymbols={selectedSymbols}
        setSelectedSymbols={setSelectedSymbols}
      />

      <main className="mx-auto max-w-[1440px] space-y-6 p-6">
        <KPITiles trades={filteredTrades} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EquityCurve trades={filteredTrades} />
          </div>
          <DirectionalBias trades={filteredTrades} />
        </div>

        <TimeAnalysis trades={filteredTrades} />

        <TradeJournal trades={filteredTrades} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <OrderTypeEfficiency trades={filteredTrades} />
          <FeeComposition trades={filteredTrades} />
        </div>
      </main>
    </div>
  );
};

export default Index;
