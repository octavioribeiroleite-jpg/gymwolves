import { useState, useRef } from "react";
import { useCreateCheckin, useCreateCheckinAll } from "@/hooks/useCheckins";
import { useCreatePost } from "@/hooks/useChallengePosts";
import { supabase } from "@/integrations/supabase/client";
import { uploadToStorage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { ActiveChallenge } from "@/hooks/useUserChallenges";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday } from "date-fns";
import CheckinDatePicker from "./CheckinDatePicker";

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
  const { user } = useAuth();
  const [workoutType, setWorkoutType] = useState("musculacao");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createCheckin = useCreateCheckin();
  const createCheckinAll = useCreateCheckinAll();
  const createPost = useCreatePost();
  const isPending = createCheckin.isPending || createCheckinAll.isPending || uploading;

  const selectedLabel = WORKOUT_TYPES.find((w) => w.value === workoutType)?.label || "Treino";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo || !user) return null;
    return await uploadToStorage(photo, user.id);
  };

  const postToFeed = (photoUrl: string, groups: { groupId: string }[], calories?: number, durationMin?: number) => {
    const emoji = WORKOUT_TYPES.find((w) => w.value === workoutType)?.emoji || "⚡";
    let caption = `${emoji} ${selectedLabel}`;
    const stats: string[] = [];
    if (calories && calories > 0) stats.push(`🔥 ${calories} kcal`);
    if (durationMin && durationMin > 0) stats.push(`⏱ ${durationMin}min`);
    if (stats.length > 0) {
      caption += ` · ${stats.join(" · ")}`;
    } else {
      caption += ` · Check-in do dia ✅`;
    }
    const uniqueGroupIds = [...new Set(groups.map((g) => g.groupId))];
    uniqueGroupIds.forEach((gid) => {
      createPost.mutate({ challengeId: gid, imageUrl: photoUrl, caption });
    });
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      const photoUrl = await uploadPhoto();
      const hasBatch = activeChallenges && activeChallenges.length > 0;

      const onSuccess = () => {
        if (photoUrl && activeChallenges && activeChallenges.length > 0) {
          postToFeed(photoUrl, activeChallenges);
        } else if (photoUrl && groupId) {
          postToFeed(photoUrl, [{ groupId }]);
        }
        onDone();
      };

      if (hasBatch) {
        createCheckinAll.mutate(
          {
            challenges: activeChallenges,
            title: selectedLabel,
            workoutType,
            proofUrl: photoUrl || undefined,
          },
          { onSuccess }
        );
      } else {
        createCheckin.mutate(
          {
            groupId,
            title: selectedLabel,
            workoutType,
            proofUrl: photoUrl || undefined,
          },
          { onSuccess }
        );
      }
    } catch {
      setUploading(false);
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

      {/* Photo upload */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {photoPreview ? (
        <div className="relative">
          <img
            src={photoPreview}
            alt="Preview"
            className="h-40 w-full rounded-[16px] object-cover"
          />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-subtle bg-secondary/50 py-4 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Camera className="h-5 w-5" />
          <span className="text-sm font-medium">Adicionar foto do treino</span>
        </button>
      )}

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
