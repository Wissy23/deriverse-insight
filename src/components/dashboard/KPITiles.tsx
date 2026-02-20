import { TrendingUp, TrendingDown, BarChart3, Shield, Clock, Activity } from "lucide-react";
import { Trade } from "@/data/mockTrades";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface KPIProps {
  trades: Trade[];
}

export function KPITiles({ trades }: KPIProps) {
  const totalPnl = trades.reduce((s, t) => s + t.realizedPnl, 0);
  const wins = trades.filter((t) => t.realizedPnl > 0);
  const losses = trades.filter((t) => t.realizedPnl < 0);
  const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;
  const totalVolume = trades.reduce((s, t) => s + t.size * t.entryPrice, 0);
  const totalFees = trades.reduce((s, t) => s + t.fee, 0);
  const largestWin = trades.length ? Math.max(...trades.map((t) => t.realizedPnl)) : 0;
  const largestLoss = trades.length ? Math.min(...trades.map((t) => t.realizedPnl)) : 0;

  // Avg trade duration
  const avgDuration = trades.length
    ? trades.reduce((s, t) => s + (new Date(t.exitTime).getTime() - new Date(t.entryTime).getTime()), 0) /
      trades.length /
      60000
    : 0;

  // Price range analysis
  const avgRange = trades.length
    ? trades.reduce((s, t) => {
        const range = ((t.candleHigh - t.candleLow) / t.entryPrice) * 100;
        return s + range;
      }, 0) / trades.length
    : 0;

  // Profit factor
  const grossProfit = wins.reduce((s, t) => s + t.realizedPnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.realizedPnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Sparkline data
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

  const profitFactorAngle = Math.min(profitFactor / 4, 1);
  const pfCircumference = 2 * Math.PI * 28;
  const pfOffset = pfCircumference - profitFactorAngle * pfCircumference;

  function formatDuration(mins: number) {
    if (mins < 60) return `${mins.toFixed(0)}m`;
    if (mins < 1440) return `${(mins / 60).toFixed(1)}h`;
    return `${(mins / 1440).toFixed(1)}d`;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total PnL */}
      <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0ms" }}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total PnL</p>
            <p className={`text-2xl font-bold tracking-tight ${totalPnl >= 0 ? "text-profit" : "text-loss"}`}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              totalPnl >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
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
                    <stop offset="0%" stopColor={totalPnl >= 0 ? "hsl(174,100%,46%)" : "hsl(340,82%,60%)"} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={totalPnl >= 0 ? "hsl(174,100%,46%)" : "hsl(340,82%,60%)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="pnl" stroke={totalPnl >= 0 ? "hsl(174,100%,46%)" : "hsl(340,82%,60%)"} fill="url(#sparkGrad)" strokeWidth={1.5} dot={false} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Win Rate + Profit Factor */}
      <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "50ms" }}>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
              <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke="hsl(var(--profit))"
                strokeWidth="5"
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
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Win Rate</p>
            <p className="text-lg font-semibold">{wins.length}<span className="text-muted-foreground">/{trades.length}</span></p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">PF:</span>
              <span className={`text-xs font-bold ${profitFactor >= 1.5 ? "text-profit" : profitFactor >= 1 ? "text-chart-5" : "text-loss"}`}>
                {profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Duration & Range */}
      <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neon-cyan/10">
            <Clock className="h-5 w-5 text-neon-cyan" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Duration & Range</p>
            <p className="text-lg font-semibold">{formatDuration(avgDuration)}</p>
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-neon-blue" />
              <span className="text-[10px] text-muted-foreground">Δ {avgRange.toFixed(2)}% avg range</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "150ms" }}>
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neon-purple/10">
            <Shield className="h-5 w-5 text-neon-purple" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Risk Metrics</p>
            <div className="flex gap-3 text-xs">
              <span className="text-profit">▲ ${largestWin.toFixed(2)}</span>
              <span className="text-loss">▼ ${largestLoss.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Vol: ${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} · Fee: ${totalFees.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
