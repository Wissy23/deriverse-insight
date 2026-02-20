import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/data/mockTrades";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Sector } from "recharts";

interface Props {
  trades: Trade[];
  onAssetClick?: (asset: string | null) => void;
  highlightedAsset?: string | null;
}

const COLORS = [
  "hsl(263,70%,58%)",
  "hsl(217,91%,60%)",
  "hsl(142,76%,46%)",
  "hsl(38,92%,50%)",
  "hsl(0,84%,60%)",
  "hsl(280,60%,50%)",
  "hsl(190,80%,50%)",
  "hsl(330,70%,55%)",
];

type ViewMode = "volume" | "pnl";

export function PortfolioComposition({ trades, onAssetClick, highlightedAsset }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("volume");

  const assetMap = new Map<string, { volume: number; pnl: number }>();
  trades.forEach((t) => {
    const cur = assetMap.get(t.asset) || { volume: 0, pnl: 0 };
    cur.volume += t.size * t.entryPrice;
    cur.pnl += t.realizedPnl;
    assetMap.set(t.asset, cur);
  });

  const data = Array.from(assetMap.entries())
    .map(([asset, vals], i) => ({
      name: asset,
      value: viewMode === "volume" ? parseFloat(vals.volume.toFixed(2)) : parseFloat(Math.abs(vals.pnl).toFixed(2)),
      rawPnl: vals.pnl,
      rawVolume: vals.volume,
      fill: COLORS[i % COLORS.length],
    }))
    .filter((d) => d.value > 0);

  const handleLegendClick = (asset: string) => {
    if (onAssetClick) {
      onAssetClick(highlightedAsset === asset ? null : asset);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Portfolio Composition</CardTitle>
          <div className="flex rounded-lg border border-border bg-secondary/50 p-0.5">
            <button
              onClick={() => setViewMode("volume")}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                viewMode === "volume"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By Volume
            </button>
            <button
              onClick={() => setViewMode("pnl")}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                viewMode === "pnl"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              By PnL
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(222,47%,6%)"
                >
                  {data.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.fill}
                      opacity={highlightedAsset && highlightedAsset !== d.name ? 0.3 : 1}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(222,44%,10%)",
                    border: "1px solid hsl(217,25%,16%)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    const entry = props.payload;
                    return [
                      viewMode === "volume"
                        ? `$${value.toLocaleString()}`
                        : `$${entry.rawPnl >= 0 ? "+" : ""}${entry.rawPnl.toFixed(2)}`,
                      name,
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {data.map((d, i) => (
              <button
                key={d.name}
                onClick={() => handleLegendClick(d.name)}
                className={`flex items-center gap-2 rounded-md px-2 py-1 transition-all hover:bg-accent/50 ${
                  highlightedAsset === d.name ? "bg-accent/70 ring-1 ring-primary/50" : ""
                } ${highlightedAsset && highlightedAsset !== d.name ? "opacity-40" : ""}`}
              >
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="text-left">
                  <p className="text-xs font-medium">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {viewMode === "volume"
                      ? `$${d.rawVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : <span className={d.rawPnl >= 0 ? "text-profit" : "text-loss"}>
                          {d.rawPnl >= 0 ? "+" : ""}${d.rawPnl.toFixed(2)}
                        </span>
                    }
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
