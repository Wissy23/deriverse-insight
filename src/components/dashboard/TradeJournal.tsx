import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trade } from "@/data/mockTrades";
import { MessageSquare, ArrowUpDown, Tag } from "lucide-react";

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
    <button onClick={() => handleSort(k)} className="flex items-center gap-1 hover:text-foreground">
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <>
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Trade Journal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[420px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs"><SortBtn k="asset">Asset</SortBtn></TableHead>
                  <TableHead className="text-xs">Side</TableHead>
                  <TableHead className="text-xs">Entry</TableHead>
                  <TableHead className="text-xs">Exit</TableHead>
                  <TableHead className="text-xs"><SortBtn k="size">Size</SortBtn></TableHead>
                  <TableHead className="text-xs"><SortBtn k="realizedPnl">PnL</SortBtn></TableHead>
                  <TableHead className="text-xs">Fee</TableHead>
                  <TableHead className="text-xs">Tags</TableHead>
                  <TableHead className="text-xs w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((t) => {
                  const entry = journal[t.id];
                  const isHighlighted = !highlightedAsset || highlightedAsset === t.asset;
                  return (
                    <TableRow
                      key={t.id}
                      className={`cursor-pointer border-border/30 hover:bg-accent/50 transition-opacity ${
                        isHighlighted ? "opacity-100" : "opacity-25"
                      }`}
                      onClick={() => openNote(t)}
                    >
                      <TableCell className="text-xs font-medium">{t.asset}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] px-1.5 py-0 ${
                          t.side === "Long"
                            ? "bg-profit/15 text-profit border-profit/30"
                            : "bg-loss/15 text-loss border-loss/30"
                        }`}>
                          {t.side}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">${t.entryPrice}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">${t.exitPrice}</TableCell>
                      <TableCell className="text-xs">{t.size.toLocaleString()}</TableCell>
                      <TableCell className={`text-xs font-medium ${t.realizedPnl >= 0 ? "text-profit" : "text-loss"}`}>
                        {t.realizedPnl >= 0 ? "+" : ""}${t.realizedPnl.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">${t.fee.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {entry?.tags?.map((tag) => (
                            <Badge
                              key={tag}
                              className="text-[9px] px-1 py-0 bg-primary/20 text-primary border-primary/30 cursor-pointer hover:bg-primary/30"
                              onClick={(e) => toggleQuickTag(t.id, tag, e)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry?.note && <MessageSquare className="h-3 w-3 text-primary" />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {selected && `${selected.asset} ${selected.side} — Annotation`}
            </DialogTitle>
          </DialogHeader>

          {/* Quick Tags */}
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
                      ? "border-primary bg-primary/20 text-primary"
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
            className="min-h-[100px] bg-secondary/50 border-border"
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
