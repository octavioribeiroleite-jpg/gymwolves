import { useState } from "react";
import { useCreateCheckin } from "@/hooks/useCheckins";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle } from "lucide-react";

interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  alreadyCheckedIn: boolean;
}

const CheckinDialog = ({ open, onOpenChange, groupId, alreadyCheckedIn }: CheckinDialogProps) => {
  const [title, setTitle] = useState("Treino");
  const [note, setNote] = useState("");
  const createCheckin = useCreateCheckin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createCheckin.mutate(
      { groupId, title: title.trim(), note: note.trim() || undefined },
      {
        onSuccess: () => {
          setTitle("Treino");
          setNote("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-w-sm rounded-3xl border-0 bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-title-section">Registrar Check-in</DialogTitle>
        </DialogHeader>

        {alreadyCheckedIn && (
          <div className="flex items-start gap-2 rounded-2xl bg-primary/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Hoje já conta como <strong className="text-foreground">1 dia</strong>. 
              Você pode registrar outro check-in, mas não aumenta o score do dia.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Título *</Label>
            <Input
              placeholder="Ex: Treino de peito"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12 rounded-2xl border-0 bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Nota (opcional)</Label>
            <Textarea
              placeholder="Como foi o treino?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] rounded-2xl border-0 bg-secondary resize-none"
            />
          </div>
          <Button
            type="submit"
            className="h-14 w-full rounded-2xl text-base font-semibold glow-primary"
            disabled={createCheckin.isPending}
          >
            {createCheckin.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Concluir Treino 💪
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckinDialog;
