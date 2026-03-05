import { useState } from "react";
import { useUserGroups } from "@/hooks/useGroup";
import { useGroupChallenges, useCreateChallenge } from "@/hooks/useChallenge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Trophy, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const Challenge = () => {
  const { data: groups, isLoading: gLoading } = useUserGroups();
  const group = groups?.[0];
  const { data: challenges, isLoading: cLoading } = useGroupChallenges(group?.id);
  const createChallenge = useCreateChallenge();

  const [name, setName] = useState("");
  const [goalDays, setGoalDays] = useState("200");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    format(new Date(new Date().getFullYear(), 11, 31), "yyyy-MM-dd")
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    createChallenge.mutate({
      groupId: group.id,
      name: name.trim(),
      goalDays: parseInt(goalDays),
      startDate,
      endDate,
    });
    setName("");
  };

  if (gLoading || cLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center pb-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <p className="text-muted-foreground">Primeiro, crie ou entre em um grupo.</p>
        <Button asChild size="lg" className="h-14 rounded-2xl px-8 text-base font-semibold glow-primary">
          <Link to="/grupo">Ir para Grupos</Link>
        </Button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-xl font-bold">Desafios</h1>
        </div>
      </header>
      <div className="mx-auto max-w-md space-y-4 p-4">
        {/* Existing challenges */}
        {challenges?.map((c) => (
          <Card key={c.id} className="border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-semibold font-display">{c.name}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {format(new Date(c.start_date), "dd/MM/yyyy")} — {format(new Date(c.end_date), "dd/MM/yyyy")}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Meta: <strong className="text-foreground">{c.goal_days_per_user} dias</strong> por pessoa
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Create new challenge */}
        <Card className="border-0">
          <CardContent className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold">Novo Desafio</h2>
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

export default Challenge;
