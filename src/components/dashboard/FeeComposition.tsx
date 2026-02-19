import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trade } from "@/data/mockTrades";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  trades: Trade[];
}

export function FeeComposition({ trades }: Props) {
  // Group by asset
  const assetMap = new Map<string, { network: number; protocol: number }>();
  trades.forEach((t) => {
    const cur = assetMap.get(t.asset) || { network: 0, protocol: 0 };
    cur.network += t.networkFee;
    cur.protocol += t.protocolFee;
    assetMap.set(t.asset, cur);
  });

  const data = Array.from(assetMap.entries()).map(([asset, fees]) => ({
    asset,
    network: parseFloat(fees.network.toFixed(2)),
    protocol: parseFloat(fees.protocol.toFixed(2)),
  }));

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Fee Composition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,25%,16%)" />
              <XAxis dataKey="asset" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "hsl(222,44%,10%)", border: "1px solid hsl(217,25%,16%)", borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="network" name="Network Fee" stackId="a" fill="hsl(217,91%,60%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="protocol" name="Protocol Fee" stackId="a" fill="hsl(263,70%,58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
