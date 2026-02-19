import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trade } from "@/data/mockTrades";
import { MessageSquare, ArrowUpDown } from "lucide-react";

interface Props {
  trades: Trade[];
}

type SortKey = "asset" | "realizedPnl" | "entryTime" | "size";

export function TradeJournal({ trades }: Props) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Trade | null>(null);
  const [noteText, setNoteText] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("entryTime");
  const [sortAsc, setSortAsc] = useState(false);

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
    setNoteText(notes[t.id] || "");
  };

  const saveNote = () => {
    if (selected) {
      setNotes({ ...notes, [selected.id]: noteText });
      setSelected(null);
    }
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
                  <TableHead className="text-xs w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer border-border/30 hover:bg-accent/50"
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
                      {notes[t.id] && <MessageSquare className="h-3 w-3 text-primary" />}
                    </TableCell>
                  </TableRow>
                ))}
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
