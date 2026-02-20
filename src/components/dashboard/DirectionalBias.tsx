import { Trade } from "@/data/mockTrades";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  trades: Trade[];
}

export function DirectionalBias({ trades }: Props) {
  const longs = trades.filter((t) => t.side === "Long");
  const shorts = trades.filter((t) => t.side === "Short");

  const data = [
    {
      direction: "Long",
      count: longs.length,
      pnl: parseFloat(longs.reduce((s, t) => s + t.realizedPnl, 0).toFixed(2)),
    },
    {
      direction: "Short",
      count: shorts.length,
      pnl: parseFloat(shorts.reduce((s, t) => s + t.realizedPnl, 0).toFixed(2)),
    },
  ];

  return (
    <div className="glass-card animate-fade-in" style={{ animationDelay: "100ms" }}>
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium">Directional Bias</h3>
      </div>
      <div className="p-4 pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,14%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(218,15%,50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="direction" tick={{ fontSize: 12, fill: "hsl(210,40%,96%)" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ background: "hsl(225,28%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }}
              />
              <Bar dataKey="pnl" name="PnL" radius={[0, 6, 6, 0]} fill="hsl(263,70%,58%)" animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-6 text-xs text-muted-foreground">
          <span>Long: {longs.length} trades ({trades.length ? ((longs.length / trades.length) * 100).toFixed(0) : 0}%)</span>
          <span>Short: {shorts.length} trades ({trades.length ? ((shorts.length / trades.length) * 100).toFixed(0) : 0}%)</span>
        </div>
      </div>
    </div>
  );
}
