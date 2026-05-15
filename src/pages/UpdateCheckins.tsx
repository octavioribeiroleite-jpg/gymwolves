import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isAfter,
  isToday,
  isSameMonth,
  subMonths,
  addMonths,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useUserGroups } from "@/hooks/useGroupData";
import { useAllUserCheckins, useCreateCheckinAll } from "@/hooks/useCheckins";
import { useUserActiveChallenges } from "@/hooks/useUserChallenges";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const UpdateCheckins = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: groups } = useUserGroups();
  const groupIds = useMemo(() => groups?.map((g: any) => g.id) || [], [groups]);
  const { data: allCheckins } = useAllUserCheckins(groupIds.length ? groupIds : undefined);
  const { data: activeChallenges } = useUserActiveChallenges();
  const createCheckinAll = useCreateCheckinAll();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const doneSet = useMemo(() => {
    const set = new Set<string>();
    if (!allCheckins || !user) return set;
    for (const c of allCheckins) {
      if (c.user_id !== user.id) continue;
      set.add(format(parseISO(c.checkin_at), "yyyy-MM-dd"));
    }
    return set;
  }, [allCheckins, user]);

  const missingDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const today = new Date();
    const days = eachDayOfInterval({ start, end });
    return days.filter((d) => {
      if (isAfter(d, today)) return false;
      if (isToday(d)) return false;
      const key = format(d, "yyyy-MM-dd");
      return !doneSet.has(key);
    });
  }, [currentMonth, doneSet]);

  const canGoNext = !isSameMonth(currentMonth, new Date());

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(missingDays.map((d) => format(d, "yyyy-MM-dd"))));
  };
  const clearAll = () => setSelected(new Set());

  const allSelected =
    missingDays.length > 0 && selected.size === missingDays.length;

  const handleSubmit = async () => {
    if (!activeChallenges || activeChallenges.length === 0) {
      toast.error("Você precisa estar em um grupo ativo.");
      return;
    }
    const dates = Array.from(selected)
      .sort()
      .map((k) => parseISO(k));
    if (dates.length === 0) return;

    setSubmitting(true);
    let ok = 0;
    let skipped = 0;
    for (const date of dates) {
      try {
        await createCheckinAll.mutateAsync({
          challenges: activeChallenges,
          title: "Treino",
          workoutType: "musculacao",
          checkinDate: date,
        });
        ok++;
      } catch (e: any) {
        // hook lança quando já existe — contamos como pulado
        skipped++;
      }
    }
    setSubmitting(false);

    if (ok > 0) {
      toast.success(
        `${ok} dia${ok > 1 ? "s" : ""} marcado${ok > 1 ? "s" : ""}${
          skipped > 0 ? ` · ${skipped} já existia${skipped > 1 ? "m" : ""}` : ""
        }`
      );
      navigate("/");
    } else if (skipped > 0) {
      toast.error("Esses dias já tinham check-in.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-subtle">
        <div className="mx-auto max-w-md flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[15px] font-bold">Atualizar check-ins</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-3 space-y-3">
        {/* Month nav */}
        <div className="flex items-center justify-between rounded-2xl surface-1 border border-subtle px-2 py-2">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-muted/50"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-[14px] font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            disabled={!canGoNext}
            className="p-1.5 rounded-lg hover:bg-muted/50 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Toolbar */}
        {missingDays.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] text-muted-foreground">
              {selected.size} de {missingDays.length} selecionado
              {selected.size === 1 ? "" : "s"}
            </span>
            <button
              onClick={allSelected ? clearAll : selectAll}
              className="text-[12px] font-bold text-primary"
            >
              {allSelected ? "Limpar" : "Selecionar todos"}
            </button>
          </div>
        )}

        {/* List */}
        {missingDays.length === 0 ? (
          <div className="rounded-2xl surface-1 border border-subtle p-8 text-center">
            <CalendarCheck className="mx-auto h-8 w-8 text-primary/60 mb-2" />
            <p className="text-[14px] font-semibold">Nenhum dia faltante</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Você está em dia com seus treinos neste mês 🎉
            </p>
          </div>
        ) : (
          <div className="rounded-2xl surface-1 border border-subtle overflow-hidden">
            {missingDays.map((d, i) => {
              const key = format(d, "yyyy-MM-dd");
              const isSel = selected.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                    i > 0 ? "border-t border-subtle" : ""
                  } ${isSel ? "bg-primary/5" : "hover:bg-muted/30"}`}
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold capitalize">
                      {format(d, "EEEE, dd 'de' MMM", { locale: ptBR })}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Não treinou
                    </span>
                  </div>
                  <Checkbox checked={isSel} className="h-5 w-5 pointer-events-none" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {missingDays.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-background/95 backdrop-blur border-t border-subtle">
          <div className="mx-auto max-w-md px-4 py-3">
            <Button
              onClick={handleSubmit}
              disabled={selected.size === 0 || submitting}
              className="h-12 w-full rounded-[16px] text-[14px] font-bold"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-5 w-5" />
              )}
              {submitting
                ? "Marcando..."
                : `Marcar ${selected.size || ""} dia${
                    selected.size === 1 ? "" : "s"
                  } como treinado${selected.size === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateCheckins;
