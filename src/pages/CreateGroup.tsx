import { useState } from "react";
import { useCreateGroup } from "@/hooks/useGroupData";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trophy, Users2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import AppScaffold from "@/components/ds/AppScaffold";

const CreateGroup = () => {
  const createGroup = useCreateGroup();
  const { setActiveGroupId } = useActiveGroup();
  const navigate = useNavigate();

  const [step, setStep] = useState<"type" | "form">("type");
  const [name, setName] = useState("");
  const [type, setType] = useState<"challenge" | "club">("challenge");
  const [goalTotal, setGoalTotal] = useState("200");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    format(new Date(new Date().getFullYear(), 11, 31), "yyyy-MM-dd")
  );

  const daysDiff = startDate && endDate ? differenceInDays(new Date(endDate), new Date(startDate)) : 0;

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

  if (step === "type") {
    return (
      <AppScaffold title="Criar grupo" subtitle="Escolha o tipo de grupo que deseja criar." showBack>
        <button
          onClick={() => { setType("challenge"); setStep("form"); }}
          className="w-full text-left rounded-[20px] surface-1 border border-subtle p-5 transition-all hover:ring-2 hover:ring-primary/30 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-h2">Desafio</h3>
          </div>
          <p className="text-subtitle text-muted-foreground">
            Uma competição única com data de início e término. Os membros competem dentro do prazo para alcançar o topo do ranking.
          </p>
          <p className="text-caption text-muted-foreground mt-2">
            Bom para metas específicas e objetivos determinados.
          </p>
        </button>

        <button
          onClick={() => { setType("club"); setStep("form"); }}
          className="w-full text-left rounded-[20px] surface-1 border border-subtle p-5 transition-all hover:ring-2 hover:ring-primary/30 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-info/10">
              <Users2 className="h-5 w-5 text-info" />
            </div>
            <h3 className="text-h2">Clube</h3>
          </div>
          <p className="text-subtitle text-muted-foreground">
            Uma comunidade fitness contínua que promove responsabilidade. Rankings rastreados semanalmente, mensalmente e anualmente.
          </p>
          <p className="text-caption text-muted-foreground mt-2">
            Bom para grupos permanentes e de baixa manutenção.
          </p>
        </button>

        <p className="text-caption text-muted-foreground text-center px-4">
          Se você é novo no aplicativo, recomendamos experimentar primeiro com um desafio.
        </p>
      </AppScaffold>
    );
  }

  return (
    <AppScaffold title={type === "challenge" ? "Criar desafio" : "Criar clube"} showBack>
      <div className="rounded-[20px] surface-1 border border-subtle p-5">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-caption font-medium text-muted-foreground">Nome do {type === "challenge" ? "desafio" : "clube"}</Label>
            <Input
              placeholder="Ex: Matilha 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-[52px] rounded-[16px] border-subtle bg-secondary text-body"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-caption font-medium text-muted-foreground">Meta de treinos</Label>
            <Input
              type="number"
              min={1}
              max={366}
              value={goalTotal}
              onChange={(e) => setGoalTotal(e.target.value)}
              required
              className="h-[52px] rounded-[16px] border-subtle bg-secondary text-body"
            />
          </div>

          {type === "challenge" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-caption font-medium text-muted-foreground">Data início</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="h-[52px] rounded-[16px] border-subtle bg-secondary text-body" />
                </div>
                <div className="space-y-2">
                  <Label className="text-caption font-medium text-muted-foreground">Data fim</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="h-[52px] rounded-[16px] border-subtle bg-secondary text-body" />
                </div>
              </div>
              {daysDiff > 0 && (
                <p className="text-caption text-primary font-medium text-center">{daysDiff} dias de duração</p>
              )}
            </>
          )}

          <Button type="submit" className="h-14 w-full rounded-[18px] text-body font-bold glow-primary" disabled={createGroup.isPending}>
            {createGroup.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar {type === "challenge" ? "desafio" : "clube"}
          </Button>
        </form>
      </div>
    </AppScaffold>
  );
};

export default CreateGroup;
