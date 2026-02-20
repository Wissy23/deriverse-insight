import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/data/mockTrades";
import { Activity, Crosshair, Timer, TrendingUp } from "lucide-react";

interface Props {
  trades: Trade[];
}

function calcSlippage(trades: Trade[]) {
  if (!trades.length) return { avg: 0, worst: 0, best: Infinity };
  const slippages = trades.map((t) => {
    const slipBps = Math.abs((t.entryPrice - t.requestedPrice) / t.requestedPrice) * 10000;
    return parseFloat(slipBps.toFixed(2));
  });
  return {
    avg: parseFloat((slippages.reduce((a, b) => a + b, 0) / slippages.length).toFixed(2)),
    worst: Math.max(...slippages),
    best: Math.min(...slippages),
  };
}

function calcEntryExitQuality(trades: Trade[]) {
  if (!trades.length) return { avg: 0, best: 0 };
  const scores = trades.map((t) => {
    const range = t.candleHigh - t.candleLow;
    if (range === 0) return 50;
    let entryScore: number;
    let exitScore: number;
    if (t.side === "Long") {
      entryScore = 1 - (t.entryPrice - t.candleLow) / range;
      exitScore = (t.exitPrice - t.candleLow) / range;
    } else {
      entryScore = (t.entryPrice - t.candleLow) / range;
      exitScore = 1 - (t.exitPrice - t.candleLow) / range;
    }
    return Math.round(Math.max(0, Math.min(100, ((entryScore + exitScore) / 2) * 100)));
  });
  return {
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    best: Math.max(...scores),
  };
}

function calcTimeToFill(trades: Trade[]) {
  if (!trades.length) return { avg: 0, median: 0 };
  const times = trades.map((t) => t.timeToFillMs).sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const median = times[Math.floor(times.length / 2)];
  return { avg: Math.round(avg), median };
}

function formatMs(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function GaugeRing({ score, max = 100, color, size = 56 }: { score: number; max?: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(score / max, 1);
  const offset = circumference - progress * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold">{score}</span>
      </div>
    </div>
  );
}

function calcProfitFactor(trades: Trade[]) {
  const wins = trades.filter((t) => t.realizedPnl > 0);
  const losses = trades.filter((t) => t.realizedPnl < 0);
  const grossProfit = wins.reduce((s, t) => s + t.realizedPnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.realizedPnl, 0));
  return {
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    winLossRatio: losses.length > 0 ? wins.length / losses.length : wins.length > 0 ? Infinity : 0,
    wins: wins.length,
    losses: losses.length,
  };
}

export function TradeEfficiency({ trades }: Props) {
  const slippage = calcSlippage(trades);
  const quality = calcEntryExitQuality(trades);
  const ttf = calcTimeToFill(trades);
  const pf = calcProfitFactor(trades);

  return (
    <div className="glass-card animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium">Trade Efficiency</h3>
      </div>
      <div className="space-y-5 p-4 pt-0">
        {/* Profit Factor & W/L Ratio */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-neon-purple" />
            Performance
          </div>
          <div className="flex items-center gap-4">
            <GaugeRing
              score={pf.profitFactor === Infinity ? 99 : parseFloat(pf.profitFactor.toFixed(1))}
              max={4}
              color={pf.profitFactor >= 1.5 ? "hsl(var(--profit))" : pf.profitFactor >= 1 ? "hsl(var(--chart-5))" : "hsl(var(--loss))"}
            />
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Profit Factor</span>
                <span className="font-semibold">{pf.profitFactor === Infinity ? "∞" : pf.profitFactor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">W/L Ratio</span>
                <span className="font-semibold">{pf.winLossRatio === Infinity ? "∞" : pf.winLossRatio.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="text-profit">{pf.wins}W</span>
                <span className="text-loss">{pf.losses}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slippage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-neon-cyan" />
            Slippage Analysis
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-secondary/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">Avg</p>
              <p className="text-sm font-semibold">{slippage.avg} bps</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">Best</p>
              <p className="text-sm font-semibold text-profit">{slippage.best} bps</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">Worst</p>
              <p className="text-sm font-semibold text-loss">{slippage.worst} bps</p>
            </div>
          </div>
        </div>

        {/* Entry/Exit Quality */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Crosshair className="h-3.5 w-3.5 text-neon-purple" />
            Entry/Exit Quality
          </div>
          <div className="flex items-center gap-3">
            <GaugeRing
              score={quality.avg}
              color={quality.avg >= 70 ? "hsl(var(--profit))" : quality.avg >= 40 ? "hsl(var(--chart-5))" : "hsl(var(--loss))"}
              size={48}
            />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-full rounded-full bg-secondary/60">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${quality.avg >= 70 ? "bg-profit" : quality.avg >= 40 ? "bg-chart-5" : "bg-loss"}`}
                  style={{ width: `${quality.avg}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Best: {quality.best}/100</p>
            </div>
          </div>
        </div>

        {/* Time-to-Fill */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Timer className="h-3.5 w-3.5 text-chart-5" />
            Time-to-Fill
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-secondary/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">Avg</p>
              <p className="text-sm font-semibold">{formatMs(ttf.avg)}</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">Median</p>
              <p className="text-sm font-semibold">{formatMs(ttf.median)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
