import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserGroups, useGroupMembers } from "@/hooks/useGroup";
import { useGroupChallenges } from "@/hooks/useChallenge";
import { useWorkoutLogs } from "@/hooks/useWorkoutLogs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

const History = () => {
  const { user } = useAuth();
  const { data: groups } = useUserGroups();
  const group = groups?.[0];
  const { data: members } = useGroupMembers(group?.id);
  const { data: challenges } = useGroupChallenges(group?.id);
  const challenge = challenges?.[0];
  const { data: logs, isLoading } = useWorkoutLogs(challenge?.id);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const activeUserId = selectedUserId || user?.id || members?.[0]?.user_id;

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
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  const monthWorkouts = useMemo(() => {
    return [...userDates].filter((d) => {
      const date = new Date(d + "T12:00:00");
      return isSameMonth(date, currentMonth);
    }).length;
  }, [userDates, currentMonth]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-xl font-bold">Histórico</h1>
        </div>
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
                    "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                    activeUserId === m.user_id
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "bg-card text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {p?.display_name || "Sem nome"}
                </button>
              );
            })}
          </div>
        )}

        {/* Calendar */}
        <Card className="border-0">
          <CardContent className="p-5">
            {/* Month navigation */}
            <div className="mb-4 flex items-center justify-between">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold font-display capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((d, i) => (
                <div key={i} className="py-1 text-[11px] font-medium text-muted-foreground">
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
                      "flex h-10 w-full items-center justify-center rounded-xl text-sm transition-all",
                      worked && "bg-primary text-primary-foreground font-semibold",
                      !worked && !isFuture && "bg-secondary/50",
                      isFuture && "text-muted-foreground/30",
                      isToday && !worked && "ring-2 ring-primary/40"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-3 w-3 rounded-sm bg-primary" />
                <span>Treinou</span>
                <div className="ml-2 h-3 w-3 rounded-sm bg-secondary" />
                <span>Não treinou</span>
              </div>
              <span className="text-sm font-bold text-primary">{monthWorkouts} dias</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default History;
