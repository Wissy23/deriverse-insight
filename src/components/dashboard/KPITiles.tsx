import { TrendingUp, TrendingDown, Target, BarChart3, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Trade } from "@/data/mockTrades";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface KPIProps {
  trades: Trade[];
}

export function KPITiles({ trades }: KPIProps) {
  const totalPnl = trades.reduce((s, t) => s + t.realizedPnl, 0);
  const wins = trades.filter((t) => t.realizedPnl > 0);
  const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;
  const totalVolume = trades.reduce((s, t) => s + t.size * t.entryPrice, 0);
  const totalFees = trades.reduce((s, t) => s + t.fee, 0);
  const largestWin = trades.length ? Math.max(...trades.map((t) => t.realizedPnl)) : 0;
  const largestLoss = trades.length ? Math.min(...trades.map((t) => t.realizedPnl)) : 0;
  const avgDuration = trades.length
    ? trades.reduce((s, t) => s + (new Date(t.exitTime).getTime() - new Date(t.entryTime).getTime()), 0) /
      trades.length /
      60000
    : 0;

  // Sparkline data - cumulative PnL
  const sparkData = trades
    .slice()
    .sort((a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime())
    .reduce<{ pnl: number }[]>((acc, t) => {
      const last = acc.length ? acc[acc.length - 1].pnl : 0;
      acc.push({ pnl: last + t.realizedPnl });
      return acc;
    }, []);

  const pnlPercent = totalVolume ? ((totalPnl / totalVolume) * 100).toFixed(2) : "0";

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (winRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total PnL */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Total PnL</p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? "text-profit" : "text-loss"}`}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              totalPnl >= 0 ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"
            }`}>
              {totalPnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {pnlPercent}%
            </div>
          </div>
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={totalPnl >= 0 ? "hsl(142,76%,46%)" : "hsl(0,84%,60%)"} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={totalPnl >= 0 ? "hsl(142,76%,46%)" : "hsl(0,84%,60%)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="pnl" stroke={totalPnl >= 0 ? "hsl(142,76%,46%)" : "hsl(0,84%,60%)"} fill="url(#sparkGrad)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
              <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke="hsl(var(--profit))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{winRate.toFixed(0)}%</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Win Rate</p>
            <p className="text-lg font-semibold">{wins.length}/{trades.length}</p>
            <p className="text-[10px] text-muted-foreground">winning trades</p>
          </div>
        </CardContent>
      </Card>

      {/* Volume & Fees */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neon-blue/15">
            <BarChart3 className="h-5 w-5 text-neon-blue" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Volume & Fees</p>
            <p className="text-lg font-semibold">${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-muted-foreground">Fees: ${totalFees.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Risk Metrics</p>
            <div className="flex gap-3 text-xs">
              <span className="text-profit">▲ ${largestWin.toFixed(2)}</span>
              <span className="text-loss">▼ ${largestLoss.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Avg: {avgDuration.toFixed(0)}m</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
