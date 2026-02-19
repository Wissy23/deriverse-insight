import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Time Analysis</CardTitle>
        <div className="flex rounded-md border border-border bg-secondary/50 p-0.5">
          {(["hour", "day"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-2.5 py-1 text-[10px] font-medium transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "hour" ? "By Hour" : "By Day"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,25%,16%)" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "hsl(222,44%,10%)", border: "1px solid hsl(217,25%,16%)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="pnl" name="PnL" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? "hsl(142,76%,46%)" : "hsl(0,84%,60%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
