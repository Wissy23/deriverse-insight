import { useState } from "react";
import { Wallet, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALL_SYMBOLS } from "@/data/mockTrades";

type DateRange = "24h" | "7d" | "30d" | "all";

interface HeaderProps {
  dateRange: DateRange;
  setDateRange: (r: DateRange) => void;
  selectedSymbols: string[];
  setSelectedSymbols: (s: string[]) => void;
}

export function Header({ dateRange, setDateRange, selectedSymbols, setSelectedSymbols }: HeaderProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [symbolOpen, setSymbolOpen] = useState(false);

  const toggleSymbol = (s: string) => {
    setSelectedSymbols(
      selectedSymbols.includes(s) ? selectedSymbols.filter((x) => x !== s) : [...selectedSymbols, s]
    );
  };

  const ranges: { label: string; value: DateRange }[] = [
    { label: "24h", value: "24h" },
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "All", value: "all" },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
          <span className="text-lg font-black text-primary">D</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          Deriverse <span className="text-muted-foreground font-normal">Analytics</span>
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range */}
        <div className="flex rounded-lg border border-border bg-secondary/50 p-0.5">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setDateRange(r.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                dateRange === r.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Symbol Filter */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSymbolOpen(!symbolOpen)}
            className="gap-1.5 text-xs"
          >
            Tokens {selectedSymbols.length > 0 && `(${selectedSymbols.length})`}
            <ChevronDown className="h-3 w-3" />
          </Button>
          {symbolOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-popover p-2 shadow-xl">
              {ALL_SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymbol(s)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs transition-colors ${
                    selectedSymbols.includes(s)
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {s}
                  {selectedSymbols.includes(s) && <X className="h-3 w-3" />}
                </button>
              ))}
              {selectedSymbols.length > 0 && (
                <button
                  onClick={() => setSelectedSymbols([])}
                  className="mt-1 w-full rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Wallet */}
        <Button
          variant={walletConnected ? "secondary" : "default"}
          size="sm"
          onClick={() => setWalletConnected(!walletConnected)}
          className="gap-2 text-xs"
        >
          <Wallet className="h-3.5 w-3.5" />
          {walletConnected ? "8xF2...k9Qp" : "Connect Wallet"}
        </Button>
      </div>
    </header>
  );
}
