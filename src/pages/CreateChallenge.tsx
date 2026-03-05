import { useState } from "react";
import { useCreateChallengeNew } from "@/hooks/useChallengeData";
import { useActiveChallenge } from "@/contexts/ActiveChallengeContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import BottomNav from "@/components/BottomNav";

const CreateChallenge = () => {
  const createChallenge = useCreateChallengeNew();
  const { setActiveChallengeId } = useActiveChallenge();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [goalDays, setGoalDays] = useState("200");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    format(new Date(new Date().getFullYear(), 11, 31), "yyyy-MM-dd")
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    createChallenge.mutate(
      {
        name: name.trim(),
        goalDays: parseInt(goalDays),
        startDate,
        endDate,
      },
      {
        onSuccess: (challenge) => {
          setActiveChallengeId(challenge.id);
          navigate(`/desafios/${challenge.id}/convidar`);
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
          <h1 className="font-display text-xl font-bold">Criar Desafio</h1>
        </div>
      </header>
      <div className="mx-auto max-w-md p-4">
        <Card className="border-0">
          <CardContent className="p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Nome do desafio</Label>
                <Input
                  placeholder="Ex: Desafio 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 rounded-xl border-0 bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Meta de dias por pessoa</Label>
                <Input
                  type="number"
                  min={1}
                  max={366}
                  value={goalDays}
                  onChange={(e) => setGoalDays(e.target.value)}
                  required
                  className="h-12 rounded-xl border-0 bg-secondary"
                />
              </div>
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
              <Button type="submit" className="h-14 w-full rounded-2xl text-base font-semibold glow-primary" disabled={createChallenge.isPending}>
                {createChallenge.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Desafio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default CreateChallenge;
