import { CheckCircle2, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkoutStatusCardProps {
  todayDone: boolean;
  onCheckin: () => void;
}

const WorkoutStatusCard = ({ todayDone, onCheckin }: WorkoutStatusCardProps) => {
  return (
    <button
      onClick={onCheckin}
      className={`flex w-full items-center gap-4 rounded-2xl p-4 transition-all duration-200 border card-shadow ${
        todayDone
          ? "gradient-primary glow-primary border-transparent"
          : "surface-1 border-subtle hover:border-primary/20"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${
          todayDone ? "bg-primary-foreground/20" : "bg-primary/10"
        }`}
      >
        {todayDone ? (
          <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
        ) : (
          <Dumbbell className="h-6 w-6 text-primary" />
        )}
      </div>
      <div className="flex-1 text-left">
        <p className={`text-[16px] font-bold ${todayDone ? "text-primary-foreground" : ""}`}>
          {todayDone ? "Treino concluído! 💪" : "Registrar treino"}
        </p>
        <p className={`text-[13px] mt-0.5 ${todayDone ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>
    </button>
  );
};

export default WorkoutStatusCard;
