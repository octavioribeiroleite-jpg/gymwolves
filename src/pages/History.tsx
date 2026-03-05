import { useState, useMemo } from "react";
import { useUserGroups, useGroupMembers } from "@/hooks/useGroup";
import { useGroupChallenges } from "@/hooks/useChallenge";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

const History = () => {
  const { data: groups } = useUserGroups();
  const group = groups?.[0];
  const { data: members } = useGroupMembers(group?.id);
  const { data: challenges } = useGroupChallenges(group?.id);
  const challenge = challenges?.[0];
  const { data: logs, isLoading } = useWorkoutLogs(challenge?.id);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const activeUserId = selectedUserId || members?.[0]?.user_id;

  const userDates = useMemo(() => {
    if (!logs || !activeUserId) return new Set<string>();
    return new Set(
      logs.filter((l) => l.user_id === activeUserId).map((l) => l.workout_date)
    );
  }, [logs, activeUserId]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startDayOffset = getDay(startOfMonth(currentMonth));
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card px-4 py-4">
        <h1 className="mx-auto max-w-md font-display text-xl font-bold">Histórico</h1>
      </header>
      <div className="mx-auto max-w-md space-y-4 p-4">
        {/* Member selector */}
        {members && members.length > 1 && (
          <div className="flex gap-2">
            {members.map((m) => {
              const p = m.profiles as any;
              return (
                <button
                  key={m.user_id}
                  onClick={() => setSelectedUserId(m.user_id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    activeUserId === m.user_id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {p?.display_name || "Sem nome"}
                </button>
              );
            })}
          </div>
        )}

        {/* Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base font-display capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((d) => (
                <div key={d} className="py-1 text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const worked = userDates.has(dateStr);
                const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
                const isFuture = day > new Date();
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "flex h-9 w-full items-center justify-center rounded-md text-sm transition-colors",
                      worked && "bg-primary text-primary-foreground font-semibold",
                      !worked && !isFuture && "bg-muted/50",
                      isFuture && "text-muted-foreground/30",
                      isToday && !worked && "ring-2 ring-primary/30"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-primary" />
                <span>Treinou</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-muted/50" />
                <span>Não treinou</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-3 text-center text-sm text-muted-foreground">
              <strong className="text-foreground">
                {[...userDates].filter((d) => {
                  const date = new Date(d);
                  return isSameMonth(date, currentMonth);
                }).length}
              </strong>{" "}
              treinos neste mês
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default History;
