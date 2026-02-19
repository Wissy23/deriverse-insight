import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Directional Bias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,25%,16%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="direction" tick={{ fontSize: 12, fill: "hsl(210,40%,96%)" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ background: "hsl(222,44%,10%)", border: "1px solid hsl(217,25%,16%)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="pnl" name="PnL" radius={[0, 6, 6, 0]} fill="hsl(263,70%,58%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-center gap-6 text-xs text-muted-foreground">
          <span>Long: {longs.length} trades ({trades.length ? ((longs.length / trades.length) * 100).toFixed(0) : 0}%)</span>
          <span>Short: {shorts.length} trades ({trades.length ? ((shorts.length / trades.length) * 100).toFixed(0) : 0}%)</span>
        </div>
      </CardContent>
    </Card>
  );
}
