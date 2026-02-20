import { useState } from "react";
import { Trade } from "@/data/mockTrades";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  trades: Trade[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TimeAnalysis({ trades }: Props) {
  const [tab, setTab] = useState<"hour" | "day">("hour");

  const hourData = Array.from({ length: 24 }, (_, h) => {
    const bucket = trades.filter((t) => new Date(t.entryTime).getHours() === h);
    return { label: `${h}:00`, pnl: parseFloat(bucket.reduce((s, t) => s + t.realizedPnl, 0).toFixed(2)) };
  });

  const dayData = DAYS.map((d, i) => {
    const bucket = trades.filter((t) => new Date(t.entryTime).getDay() === i);
    return { label: d, pnl: parseFloat(bucket.reduce((s, t) => s + t.realizedPnl, 0).toFixed(2)) };
  });

  const data = tab === "hour" ? hourData : dayData;

  return (
    <div className="glass-card animate-fade-in">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-medium">Time Analysis</h3>
        <div className="flex rounded-lg border border-border bg-secondary/30 p-0.5">
          {(["hour", "day"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "hour" ? "By Hour" : "By Day"}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,14%)" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(218,15%,50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(218,15%,50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "hsl(225,28%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }}
              />
              <Bar dataKey="pnl" name="PnL" radius={[4, 4, 0, 0]} animationDuration={800}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? "hsl(174,100%,46%)" : "hsl(340,82%,60%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
