import { CheckCircle2, Dumbbell, Trash2, Zap, Camera } from "lucide-react";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
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
  musculacao: "Musculação", corrida: "Corrida", caminhada: "Caminhada",
  ciclismo: "Ciclismo", cardio: "Cardio", crossfit: "CrossFit",
  natacao: "Natação", yoga: "Yoga", luta: "Luta", outro: "Treino",
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
        <div className="rounded-2xl overflow-hidden shadow-md">
          {/* Banner principal */}
          <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 px-4 pt-4 pb-5">
            {/* Círculos decorativos de fundo */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-6" />

            <div className="relative flex items-center gap-3">
              {/* Ícone check */}
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base leading-tight">Treino concluído! 💪</p>
                <p className="text-white/75 text-xs mt-0.5">{typeLabel} · {timeAgo}</p>
              </div>

              {/* Foto do check-in (se houver) */}
              {signedUrl && (
                <img
                  src={signedUrl}
                  alt="Foto do treino"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white/30 shrink-0 shadow-md"
                />
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex divide-x divide-border bg-card border-x border-b border-border/50 rounded-b-2xl">
            <button
              onClick={() => {}}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              Ver check-in
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
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

  // Estado: não treinou ainda
  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-4">
        <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center shrink-0">
          <Dumbbell className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Você ainda não treinou hoje</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <button
          onClick={onCheckin}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 active:scale-95 transition-all shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          Check-in
        </button>
      </div>
    </div>
  );
};

export default WorkoutStatusCard;
