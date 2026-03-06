import { useState } from "react";
import { useCreateCheckin, useCreateCheckinAll } from "@/hooks/useCheckins";
import { ActiveChallenge } from "@/hooks/useUserChallenges";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const WORKOUT_TYPES = [
  { value: "musculacao", label: "Musculação", emoji: "🏋️" },
  { value: "corrida", label: "Corrida", emoji: "🏃" },
  { value: "crossfit", label: "Crossfit", emoji: "💪" },
  { value: "natacao", label: "Natação", emoji: "🏊" },
  { value: "ciclismo", label: "Ciclismo", emoji: "🚴" },
  { value: "yoga", label: "Yoga", emoji: "🧘" },
  { value: "luta", label: "Luta", emoji: "🥊" },
  { value: "caminhada", label: "Caminhada", emoji: "🚶" },
  { value: "aerobio", label: "Aeróbio", emoji: "🫀" },
  { value: "outro", label: "Outro", emoji: "⚡" },
];

interface Props {
  groupId: string;
  alreadyCheckedIn: boolean;
  activeChallenges?: ActiveChallenge[];
  onBack: () => void;
  onDone: () => void;
}

const CheckinQuickMode = ({ groupId, alreadyCheckedIn, activeChallenges, onBack, onDone }: Props) => {
  const [workoutType, setWorkoutType] = useState("musculacao");
  const createCheckin = useCreateCheckin();
  const createCheckinAll = useCreateCheckinAll();
  const isPending = createCheckin.isPending || createCheckinAll.isPending;

  const selectedLabel = WORKOUT_TYPES.find((w) => w.value === workoutType)?.label || "Treino";

  const handleSubmit = () => {
    const hasBatch = activeChallenges && activeChallenges.length > 0;

    if (hasBatch) {
      createCheckinAll.mutate(
        {
          challenges: activeChallenges,
          title: selectedLabel,
          workoutType,
        },
        { onSuccess: onDone }
      );
    } else {
      createCheckin.mutate(
        {
          groupId,
          title: selectedLabel,
          workoutType,
        },
        { onSuccess: onDone }
      );
    }
  };

  return (
    <div className="space-y-4">
      {alreadyCheckedIn && (
        <div className="flex items-start gap-2 rounded-[16px] bg-primary/10 p-3 text-body">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-muted-foreground">
            Hoje já conta como <strong className="text-foreground">1 dia</strong>.
            Você pode registrar outro treino, mas não aumenta o score.
          </p>
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {WORKOUT_TYPES.map((wt) => (
          <button
            key={wt.value}
            type="button"
            onClick={() => setWorkoutType(wt.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-[16px] py-2.5 transition-all",
              workoutType === wt.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <span className="text-lg">{wt.emoji}</span>
            <span className="text-[10px] font-medium leading-tight">{wt.label}</span>
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        className="h-14 w-full rounded-[18px] text-body font-bold glow-primary"
        disabled={isPending}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Marcar presença ⚡
      </Button>
    </div>
  );
};

export default CheckinQuickMode;
