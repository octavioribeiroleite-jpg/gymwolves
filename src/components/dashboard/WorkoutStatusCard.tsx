import { CheckCircle2, Dumbbell, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkoutStatusCardProps {
  todayDone: boolean;
  onCheckin: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const WorkoutStatusCard = ({ todayDone, onCheckin, onDelete, isDeleting }: WorkoutStatusCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClick = () => {
    if (todayDone) {
      setConfirmOpen(true);
    } else {
      onCheckin();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isDeleting}
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
            {todayDone
              ? "Toque para desfazer"
              : format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        {todayDone && (
          <Trash2 className="h-5 w-5 text-primary-foreground/60 shrink-0" />
        )}
      </button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover treino de hoje?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai apagar o check-in e os registros de desafios de hoje. Você poderá registrar novamente depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete?.()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkoutStatusCard;
