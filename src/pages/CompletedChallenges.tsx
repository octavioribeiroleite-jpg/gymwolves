import { useNavigate } from "react-router-dom";
import { Trophy, Loader2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AppScaffold from "@/components/ds/AppScaffold";
import EmptyState from "@/components/ds/EmptyState";
import { useCompletedGroups } from "@/hooks/useGroupData";

const CompletedChallenges = () => {
  const navigate = useNavigate();
  const { data: groups, isLoading } = useCompletedGroups();

  if (isLoading) {
    return (
      <AppScaffold title="Desafios concluídos" showBack>
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </AppScaffold>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <AppScaffold title="Desafios concluídos" showBack>
        <EmptyState
          icon={Trophy}
          title="Nenhum desafio concluído"
          description="Quando um desafio terminar, ele aparecerá aqui."
        />
      </AppScaffold>
    );
  }

  return (
    <AppScaffold title="Desafios concluídos" showBack>
      {groups.map((g: any) => (
        <button
          key={g.id}
          onClick={() => navigate(`/grupos/${g.id}/detalhes`)}
          className="w-full text-left rounded-2xl surface-1 border border-subtle p-3.5 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 className="text-[14px] font-bold truncate flex-1">{g.name}</h3>
            <span className="shrink-0 bg-secondary text-muted-foreground text-[10px] font-bold rounded-full px-2 py-0.5">
              Concluído
            </span>
          </div>
          {g.start_date && g.end_date && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(new Date(g.start_date), "dd MMM yyyy", { locale: ptBR })} —{" "}
              {format(new Date(g.end_date), "dd MMM yyyy", { locale: ptBR })}
            </div>
          )}
        </button>
      ))}
    </AppScaffold>
  );
};

export default CompletedChallenges;
