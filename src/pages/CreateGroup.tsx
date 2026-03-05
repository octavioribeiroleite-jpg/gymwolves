import { useState } from "react";
import { useCreateGroup } from "@/hooks/useGroupData";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

const CreateGroup = () => {
  const createGroup = useCreateGroup();
  const { setActiveGroupId } = useActiveGroup();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState<"challenge" | "club">("challenge");
  const [goalTotal, setGoalTotal] = useState("200");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    format(new Date(new Date().getFullYear(), 11, 31), "yyyy-MM-dd")
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup.mutate(
      {
        name: name.trim(),
        type,
        goalTotal: parseInt(goalTotal),
        ...(type === "challenge" ? { startDate, endDate } : {}),
      },
      {
        onSuccess: (group) => {
          setActiveGroupId(group.id);
          navigate(`/grupos/${group.id}/convidar`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-xl font-bold">Criar Grupo</h1>
        </div>
      </header>
      <div className="mx-auto max-w-md p-4">
        <Card className="border-0">
          <CardContent className="p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Nome do grupo</Label>
                <Input
                  placeholder="Ex: Matilha 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 rounded-xl border-0 bg-secondary"
                />
              </div>

              {/* Type selector */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Tipo</Label>
                <div className="flex rounded-xl bg-secondary p-1">
                  <button
                    type="button"
                    onClick={() => setType("challenge")}
                    className={cn(
                      "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
                      type === "challenge" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    Desafio
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("club")}
                    className={cn(
                      "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all",
                      type === "club" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    Clube
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Meta (Days Active)</Label>
                <Input
                  type="number"
                  min={1}
                  max={366}
                  value={goalTotal}
                  onChange={(e) => setGoalTotal(e.target.value)}
                  required
                  className="h-12 rounded-xl border-0 bg-secondary"
                />
              </div>

              {type === "challenge" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Início</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="h-12 rounded-xl border-0 bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Fim</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="h-12 rounded-xl border-0 bg-secondary" />
                  </div>
                </div>
              )}

              <Button type="submit" className="h-14 w-full rounded-2xl text-base font-semibold glow-primary" disabled={createGroup.isPending}>
                {createGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Grupo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default CreateGroup;
