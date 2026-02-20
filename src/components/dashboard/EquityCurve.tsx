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
    <div className="glass-card animate-fade-in" style={{ animationDelay: "50ms" }}>
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium">Equity Curve</h3>
      </div>
      <div className="p-4 pt-0">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(174,100%,46%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(174,100%,46%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(340,82%,60%)" stopOpacity={0} />
                  <stop offset="100%" stopColor="hsl(340,82%,60%)" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,14%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(218,15%,50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(218,15%,50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "hsl(225,28%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12, backdropFilter: "blur(12px)" }}
                labelStyle={{ color: "hsl(218,15%,50%)" }}
              />
              <Area type="monotone" dataKey="pnl" stroke="hsl(174,100%,46%)" fill="url(#pnlGrad)" strokeWidth={2} dot={false} name="Cumulative PnL" animationDuration={1000} />
              <Area type="monotone" dataKey="drawdown" stroke="hsl(340,82%,60%)" fill="url(#ddGrad)" strokeWidth={1.5} dot={false} name="Drawdown" animationDuration={1000} animationBegin={200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
