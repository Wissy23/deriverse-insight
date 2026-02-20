import { useState, useMemo, useCallback } from "react";
import { mockTrades } from "@/data/mockTrades";
import { Header } from "@/components/dashboard/Header";
import { KPITiles } from "@/components/dashboard/KPITiles";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { DirectionalBias } from "@/components/dashboard/DirectionalBias";
import { TimeAnalysis } from "@/components/dashboard/TimeAnalysis";
import { TradeJournal } from "@/components/dashboard/TradeJournal";
import { PortfolioComposition } from "@/components/dashboard/PortfolioComposition";
import { TradeEfficiency } from "@/components/dashboard/TradeEfficiency";
import { FeeComposition } from "@/components/dashboard/FeeComposition";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type DateRange = "24h" | "7d" | "30d" | "all";

function exportData(trades: typeof mockTrades, format: "csv" | "json") {
  let content: string;
  let mimeType: string;
  let ext: string;

  if (format === "json") {
    content = JSON.stringify(trades, null, 2);
    mimeType = "application/json";
    ext = "json";
  } else {
    const headers = Object.keys(trades[0]).join(",");
    const rows = trades.map((t) =>
      Object.values(t)
        .map((v) => (typeof v === "string" ? `"${v}"` : v))
        .join(",")
    );
    content = [headers, ...rows].join("\n");
    mimeType = "text/csv";
    ext = "csv";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deriverse-trades.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

const Index = () => {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [highlightedAsset, setHighlightedAsset] = useState<string | null>(null);

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

        <TradeJournal trades={filteredTrades} highlightedAsset={highlightedAsset} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PortfolioComposition
            trades={filteredTrades}
            onAssetClick={setHighlightedAsset}
            highlightedAsset={highlightedAsset}
          />
          <TradeEfficiency trades={filteredTrades} />
          <FeeComposition trades={filteredTrades} />
        </div>

        {/* Export */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => exportData(filteredTrades, "csv")}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => exportData(filteredTrades, "json")}>
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
