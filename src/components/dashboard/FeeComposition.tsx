import { Trade } from "@/data/mockTrades";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  trades: Trade[];
}

export function FeeComposition({ trades }: Props) {
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
    <div className="glass-card animate-fade-in" style={{ animationDelay: "250ms" }}>
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium">Fee Composition</h3>
      </div>
      <div className="p-4 pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224,20%,14%)" />
              <XAxis dataKey="asset" tick={{ fontSize: 10, fill: "hsl(218,15%,50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(218,15%,50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "hsl(225,28%,9%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="network" name="Network Fee" stackId="a" fill="hsl(199,89%,56%)" radius={[0, 0, 0, 0]} animationDuration={800} />
              <Bar dataKey="protocol" name="Protocol Fee" stackId="a" fill="hsl(263,70%,58%)" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
