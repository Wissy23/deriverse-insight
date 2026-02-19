import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/data/mockTrades";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

interface Props {
  trades: Trade[];
}

export function EquityCurve({ trades }: Props) {
  const sorted = trades.slice().sort((a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime());

  let cumPnl = 0;
  let peak = 0;
  const data = sorted.map((t) => {
    cumPnl += t.realizedPnl;
    peak = Math.max(peak, cumPnl);
    const drawdown = cumPnl - peak;
    return {
      date: format(new Date(t.exitTime), "MMM dd"),
      pnl: parseFloat(cumPnl.toFixed(2)),
      drawdown: parseFloat(drawdown.toFixed(2)),
    };
  });

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142,76%,46%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(142,76%,46%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(0,84%,60%)" stopOpacity={0} />
                  <stop offset="100%" stopColor="hsl(0,84%,60%)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,25%,16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "hsl(222,44%,10%)", border: "1px solid hsl(217,25%,16%)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(215,20%,55%)" }}
              />
              <Area type="monotone" dataKey="pnl" stroke="hsl(142,76%,46%)" fill="url(#pnlGrad)" strokeWidth={2} dot={false} name="Cumulative PnL" />
              <Area type="monotone" dataKey="drawdown" stroke="hsl(0,84%,60%)" fill="url(#ddGrad)" strokeWidth={1.5} dot={false} name="Drawdown" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
