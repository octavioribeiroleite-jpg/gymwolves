import { useState } from "react";
import { useUserGroups } from "@/hooks/useGroup";
import { useGroupChallenges, useCreateChallenge } from "@/hooks/useChallenge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center pb-20">
        <Trophy className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Primeiro, crie ou entre em um grupo.</p>
        <Button asChild><Link to="/grupo">Ir para Grupos</Link></Button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card px-4 py-4">
        <h1 className="mx-auto max-w-md font-display text-xl font-bold">Desafios</h1>
      </header>
      <div className="mx-auto max-w-md space-y-4 p-4">
        {/* Existing challenges */}
        {challenges?.map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-display">
                <Trophy className="h-4 w-4 text-primary" /> {c.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {format(new Date(c.start_date), "dd/MM/yyyy")} — {format(new Date(c.end_date), "dd/MM/yyyy")}
              </div>
              <p>Meta: <strong className="text-foreground">{c.goal_days_per_user} dias</strong> por pessoa</p>
            </CardContent>
          </Card>
        ))}

        {/* Create new challenge */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Novo Desafio</CardTitle>
            <CardDescription>Defina uma meta para o grupo "{group.name}"</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do desafio</Label>
                <Input
                  placeholder="Ex: Desafio 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Meta de dias por pessoa</Label>
                <Input
                  type="number"
                  min={1}
                  max={366}
                  value={goalDays}
                  onChange={(e) => setGoalDays(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data início</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Data fim</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createChallenge.isPending}>
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
