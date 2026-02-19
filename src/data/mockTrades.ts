export interface Trade {
  id: string;
  asset: string;
  side: "Long" | "Short";
  entryPrice: number;
  exitPrice: number;
  size: number;
  realizedPnl: number;
  fee: number;
  networkFee: number;
  protocolFee: number;
  orderType: "Market" | "Limit" | "Trigger";
  entryTime: string;
  exitTime: string;
  notes?: string;
}

const symbols = ["SOL", "BONK", "JUP", "WIF", "PYTH", "RNDR", "RAY", "ORCA"];

function r(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateTrade(i: number): Trade {
  const asset = symbols[i % symbols.length];
  const side: "Long" | "Short" = Math.random() > 0.45 ? "Long" : "Short";
  const orderType: Trade["orderType"] = ["Market", "Limit", "Trigger"][Math.floor(Math.random() * 3)] as Trade["orderType"];

  let entryPrice: number;
  switch (asset) {
    case "SOL": entryPrice = r(80, 200); break;
    case "BONK": entryPrice = r(0.00001, 0.00005, 6); break;
    case "JUP": entryPrice = r(0.5, 2.5); break;
    case "WIF": entryPrice = r(0.3, 3.5); break;
    case "PYTH": entryPrice = r(0.2, 0.8); break;
    case "RNDR": entryPrice = r(3, 12); break;
    case "RAY": entryPrice = r(1, 5); break;
    case "ORCA": entryPrice = r(1, 6); break;
    default: entryPrice = r(1, 100);
  }

  const movePercent = r(-15, 20) / 100;
  const exitPrice = parseFloat((entryPrice * (1 + (side === "Long" ? movePercent : -movePercent))).toPrecision(6));
  const size = asset === "BONK" ? r(1000000, 50000000, 0) : r(1, 500, 1);
  const pnlRaw = side === "Long"
    ? (exitPrice - entryPrice) * size
    : (entryPrice - exitPrice) * size;
  const totalFee = Math.abs(pnlRaw) * r(0.005, 0.02);
  const networkFee = totalFee * r(0.3, 0.5);
  const protocolFee = totalFee - networkFee;
  const realizedPnl = parseFloat((pnlRaw - totalFee).toFixed(2));

  const baseDate = new Date("2025-12-01");
  const dayOffset = Math.floor(i / 2);
  const hourOffset = Math.floor(Math.random() * 24);
  const entry = new Date(baseDate);
  entry.setDate(entry.getDate() + dayOffset);
  entry.setHours(hourOffset, Math.floor(Math.random() * 60));
  const durationMin = r(5, 480, 0);
  const exit = new Date(entry.getTime() + durationMin * 60000);

  return {
    id: `trade-${String(i).padStart(3, "0")}`,
    asset,
    side,
    entryPrice,
    exitPrice,
    size,
    realizedPnl,
    fee: parseFloat(totalFee.toFixed(2)),
    networkFee: parseFloat(networkFee.toFixed(2)),
    protocolFee: parseFloat(protocolFee.toFixed(2)),
    orderType,
    entryTime: entry.toISOString(),
    exitTime: exit.toISOString(),
  };
}

export const mockTrades: Trade[] = Array.from({ length: 60 }, (_, i) => generateTrade(i));

export const ALL_SYMBOLS = symbols;
