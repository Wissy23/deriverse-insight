import { useState } from "react";
import { Trade } from "@/data/mockTrades";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  trades: Trade[];
  onAssetClick?: (asset: string | null) => void;
  highlightedAsset?: string | null;
}

const COLORS = [
  "hsl(263,70%,58%)",
  "hsl(174,100%,46%)",
  "hsl(199,89%,56%)",
  "hsl(38,92%,50%)",
  "hsl(340,82%,60%)",
  "hsl(280,60%,50%)",
  "hsl(150,80%,45%)",
  "hsl(20,90%,55%)",
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
    <div className="glass-card animate-fade-in" style={{ animationDelay: "150ms" }}>
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-medium">Portfolio Composition</h3>
        <div className="flex rounded-lg border border-border bg-secondary/30 p-0.5">
          {(["volume", "pnl"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                viewMode === mode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "volume" ? "Volume" : "PnL"}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="flex items-center gap-4">
          <div className="h-48 w-48 shrink-0">
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
                  stroke="hsl(228,28%,4%)"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.fill}
                      opacity={highlightedAsset && highlightedAsset !== d.name ? 0.25 : 1}
                      style={{ cursor: "pointer", transition: "opacity 300ms" }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(225,28%,9%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize: 12,
                    backdropFilter: "blur(12px)",
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
          <div className="space-y-1.5 flex-1">
            {data.map((d, i) => (
              <button
                key={d.name}
                onClick={() => handleLegendClick(d.name)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all hover:bg-accent/50 ${
                  highlightedAsset === d.name ? "bg-accent/70 ring-1 ring-primary/40" : ""
                } ${highlightedAsset && highlightedAsset !== d.name ? "opacity-35" : ""}`}
              >
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="text-left flex-1">
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
      </div>
    </div>
  );
}
