import { CheckCircle2, Dumbbell, Trash2, Zap } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useSignedUrl } from "@/hooks/useSignedUrl";
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
  todayCheckin?: {
    title?: string;
    workout_type?: string;
    checkin_at?: string;
    proof_url?: string | null;
  } | null;
}

const workoutLabels: Record<string, string> = {
  musculacao: "Musculação",
  corrida: "Corrida",
  caminhada: "Caminhada",
  ciclismo: "Ciclismo",
  cardio: "Cardio",
  crossfit: "CrossFit",
  natacao: "Natação",
  yoga: "Yoga",
  luta: "Luta",
  outro: "Treino",
};

const WorkoutStatusCard = ({ todayDone, onCheckin, onDelete, isDeleting, todayCheckin }: WorkoutStatusCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const signedUrl = useSignedUrl(todayCheckin?.proof_url || null);

  if (todayDone) {
    const typeLabel = workoutLabels[todayCheckin?.workout_type || ""] || todayCheckin?.title || "Treino";
    const timeAgo = todayCheckin?.checkin_at
      ? formatDistanceToNow(parseISO(todayCheckin.checkin_at), { addSuffix: true, locale: ptBR })
      : "hoje";

    return (
      <>
        <div className="rounded-2xl surface-1 border border-subtle overflow-hidden card-shadow">
          {/* Green success banner */}
          <div className="gradient-primary px-3 py-2 flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-primary-foreground leading-tight">Treino concluído! 💪</p>
              <p className="text-[10px] text-primary-foreground/70 leading-tight mt-0.5">{typeLabel} · {timeAgo}</p>
            </div>
            {signedUrl && (
              <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden border-2 border-white/30">
                <img src={signedUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          {/* Actions */}
          <div className="flex items-center border-t border-subtle divide-x divide-subtle">
            <button
              onClick={onCheckin}
              className="flex-1 text-center py-2 text-[12px] font-medium text-primary hover:bg-muted/30 transition-colors"
            >
              Ver check-in
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={isDeleting}
              className="flex items-center justify-center gap-1 px-3 py-2 text-[12px] font-medium text-destructive hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Desfazer
            </button>
          </div>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover treino de hoje?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso vai apagar o check-in e os registros de desafios de hoje.
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
  }

  // Not trained today
  return (
    <div className="rounded-2xl surface-1 border border-subtle p-4 card-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Dumbbell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[15px] font-bold leading-tight">Você ainda não treinou hoje</p>
          <p className="text-[12px] text-muted-foreground mt-0.5 leading-tight">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCheckin}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-[13px] h-10 glow-primary-sm transition-all active:scale-[0.97]"
        >
          <Dumbbell className="h-4 w-4" strokeWidth={2.5} />
          Fazer check-in
        </button>
        <button
          onClick={onCheckin}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-subtle px-3.5 h-10 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all"
        >
          <Zap className="h-3.5 w-3.5" />
          Rápido
        </button>
      </div>
    </div>
  );
};

export default WorkoutStatusCard;
