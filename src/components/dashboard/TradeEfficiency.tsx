import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/data/mockTrades";
import { Activity, Crosshair, Timer } from "lucide-react";

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

function QualityBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-profit" : score >= 40 ? "bg-chart-5" : "bg-loss";
  return (
    <div className="h-1.5 w-full rounded-full bg-secondary">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
    </div>
  );
}

export function TradeEfficiency({ trades }: Props) {
  const slippage = calcSlippage(trades);
  const quality = calcEntryExitQuality(trades);
  const ttf = calcTimeToFill(trades);

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Trade Efficiency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Slippage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-neon-blue" />
            Slippage Analysis
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-secondary/50 p-2.5">
              <p className="text-[10px] text-muted-foreground">Avg</p>
              <p className="text-sm font-semibold">{slippage.avg} bps</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2.5">
              <p className="text-[10px] text-muted-foreground">Best</p>
              <p className="text-sm font-semibold text-profit">{slippage.best} bps</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2.5">
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Avg Score</span>
              <span className="text-sm font-semibold">{quality.avg}/100</span>
            </div>
            <QualityBar score={quality.avg} />
            <p className="text-[10px] text-muted-foreground">Best: {quality.best}/100</p>
          </div>
        </div>

        {/* Time-to-Fill */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Timer className="h-3.5 w-3.5 text-chart-5" />
            Time-to-Fill (On-chain)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/50 p-2.5">
              <p className="text-[10px] text-muted-foreground">Avg</p>
              <p className="text-sm font-semibold">{formatMs(ttf.avg)}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2.5">
              <p className="text-[10px] text-muted-foreground">Median</p>
              <p className="text-sm font-semibold">{formatMs(ttf.median)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
