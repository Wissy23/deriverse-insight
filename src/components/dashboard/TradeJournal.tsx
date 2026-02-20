import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trade } from "@/data/mockTrades";
import { MessageSquare, ArrowUpDown, Tag, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  trades: Trade[];
  highlightedAsset?: string | null;
}

type SortKey = "asset" | "realizedPnl" | "entryTime" | "size";

const QUICK_TAGS = ["Good Setup", "Revenge Trade", "Followed Plan", "FOMO", "Scalp"] as const;

function loadJournalData(): Record<string, { note: string; tags: string[] }> {
  try {
    const raw = localStorage.getItem("deriverse-journal");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveJournalData(data: Record<string, { note: string; tags: string[] }>) {
  localStorage.setItem("deriverse-journal", JSON.stringify(data));
}

function formatDuration(entryTime: string, exitTime: string) {
  const mins = (new Date(exitTime).getTime() - new Date(entryTime).getTime()) / 60000;
  if (mins < 60) return `${mins.toFixed(0)}m`;
  if (mins < 1440) return `${(mins / 60).toFixed(1)}h`;
  return `${(mins / 1440).toFixed(1)}d`;
}

export function TradeJournal({ trades, highlightedAsset }: Props) {
  const [journal, setJournal] = useState<Record<string, { note: string; tags: string[] }>>(loadJournalData);
  const [selected, setSelected] = useState<Trade | null>(null);
  const [noteText, setNoteText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("entryTime");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    saveJournalData(journal);
  }, [journal]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...trades].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "asset": cmp = a.asset.localeCompare(b.asset); break;
      case "realizedPnl": cmp = a.realizedPnl - b.realizedPnl; break;
      case "entryTime": cmp = new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime(); break;
      case "size": cmp = a.size * a.entryPrice - b.size * b.entryPrice; break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const openNote = (t: Trade) => {
    setSelected(t);
    const entry = journal[t.id];
    setNoteText(entry?.note || "");
    setSelectedTags(entry?.tags || []);
  };

  const saveNote = () => {
    if (selected) {
      setJournal({ ...journal, [selected.id]: { note: noteText, tags: selectedTags } });
      setSelected(null);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleQuickTag = (tradeId: string, tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const entry = journal[tradeId] || { note: "", tags: [] };
    const newTags = entry.tags.includes(tag)
      ? entry.tags.filter((t) => t !== tag)
      : [...entry.tags, tag];
    setJournal({ ...journal, [tradeId]: { ...entry, tags: newTags } });
  };

  const SortBtn = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <button onClick={() => handleSort(k)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <>
      <div className="glass-card animate-fade-in">
        <div className="flex items-center justify-between p-4 pb-3">
          <h3 className="text-sm font-medium">Trade Journal</h3>
          <span className="text-[10px] text-muted-foreground">{trades.length} trades</span>
        </div>
        <div className="max-h-[440px] overflow-auto scrollbar-thin">
          {/* Header row */}
          <div className="sticky top-0 z-10 grid grid-cols-[1fr_0.6fr_0.8fr_0.8fr_0.7fr_0.8fr_1.2fr_28px] gap-2 border-b border-border/50 bg-card/95 backdrop-blur-sm px-4 py-2 text-[11px] font-medium text-muted-foreground">
            <div><SortBtn k="asset">Asset</SortBtn></div>
            <div>Side</div>
            <div>Entry / Exit</div>
            <div><SortBtn k="size">Size</SortBtn></div>
            <div>Duration</div>
            <div><SortBtn k="realizedPnl">PnL</SortBtn></div>
            <div>Tags</div>
            <div></div>
          </div>

          {/* Trade rows */}
          <div className="divide-y divide-border/30">
            {sorted.map((t) => {
              const entry = journal[t.id];
              const isHighlighted = !highlightedAsset || highlightedAsset === t.asset;
              return (
                <div
                  key={t.id}
                  onClick={() => openNote(t)}
                  className={`grid grid-cols-[1fr_0.6fr_0.8fr_0.8fr_0.7fr_0.8fr_1.2fr_28px] gap-2 items-center px-4 py-3 cursor-pointer transition-all hover:bg-accent/30 ${
                    isHighlighted ? "opacity-100" : "opacity-20"
                  }`}
                >
                  <div className="text-xs font-semibold tracking-wide">{t.asset}</div>
                  <div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      t.side === "Long"
                        ? "bg-profit/10 text-profit"
                        : "bg-loss/10 text-loss"
                    }`}>
                      {t.side === "Long" ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                      {t.side}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    <span>${t.entryPrice.toLocaleString()}</span>
                    <span className="mx-1 text-border">→</span>
                    <span>${t.exitPrice.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px]">{t.size.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDuration(t.entryTime, t.exitTime)}
                  </div>
                  <div className={`text-xs font-semibold ${t.realizedPnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {t.realizedPnl >= 0 ? "+" : ""}${t.realizedPnl.toFixed(2)}
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {entry?.tags?.map((tag) => (
                      <span
                        key={tag}
                        onClick={(e) => toggleQuickTag(t.id, tag, e)}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div>
                    {entry?.note && <MessageSquare className="h-3 w-3 text-neon-cyan" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass-card border-white/[0.06]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {selected && `${selected.asset} ${selected.side} — Annotation`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3 w-3" /> Quick Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add your notes about this trade..."
            className="min-h-[100px] bg-secondary/30 border-white/[0.06]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Cancel</Button>
            <Button size="sm" onClick={saveNote}>Save Note</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
