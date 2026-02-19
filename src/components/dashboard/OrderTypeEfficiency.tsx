import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/data/mockTrades";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  trades: Trade[];
}

const COLORS = ["hsl(263,70%,58%)", "hsl(217,91%,60%)", "hsl(38,92%,50%)"];

export function OrderTypeEfficiency({ trades }: Props) {
  const types: Trade["orderType"][] = ["Market", "Limit", "Trigger"];
  const data = types.map((type, i) => {
    const bucket = trades.filter((t) => t.orderType === type);
    return {
      name: type,
      count: bucket.length,
      avgPnl: bucket.length ? parseFloat((bucket.reduce((s, t) => s + t.realizedPnl, 0) / bucket.length).toFixed(2)) : 0,
      fill: COLORS[i],
    };
  });

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Order Type Efficiency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  dataKey="count"
                  strokeWidth={2}
                  stroke="hsl(222,47%,6%)"
                >
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(222,44%,10%)", border: "1px solid hsl(217,25%,16%)", borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <div>
                  <p className="text-xs font-medium">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {d.count} trades · Avg: <span className={d.avgPnl >= 0 ? "text-profit" : "text-loss"}>${d.avgPnl}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
