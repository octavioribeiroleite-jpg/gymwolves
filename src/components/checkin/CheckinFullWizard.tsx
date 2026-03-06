import { useState, useRef } from "react";
import { useCreateCheckin, useCreateCheckinAll } from "@/hooks/useCheckins";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ActiveChallenge } from "@/hooks/useUserChallenges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Camera, ImagePlus, X, ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import AILoadingAnimation from "@/components/checkin/AILoadingAnimation";
import CheckinConfirmation from "@/components/checkin/CheckinConfirmation";

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

const INTENSITIES = [
  { value: "leve", label: "Leve", emoji: "🟢", desc: "Baixo esforço" },
  { value: "moderado", label: "Moderado", emoji: "🟡", desc: "Esforço médio" },
  { value: "pesado", label: "Pesado", emoji: "🔴", desc: "Máximo esforço" },
];

export interface WorkoutAnalysis {
  workout_type: string;
  duration_min?: number;
  calories: number;
  heart_rate?: number;
  distance_km?: number;
  steps?: number;
  summary: string;
}

interface Props {
  groupId: string;
  alreadyCheckedIn: boolean;
  activeChallenges?: ActiveChallenge[];
  onBack: () => void;
  onDone: () => void;
}

type Step = "photo" | "type" | "intensity" | "duration" | "analyzing" | "confirm";

const MANUAL_STEPS: Step[] = ["type", "intensity", "duration"];

const CheckinFullWizard = ({ groupId, alreadyCheckedIn, activeChallenges, onBack, onDone }: Props) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("photo");
  const [skippedPhoto, setSkippedPhoto] = useState(false);
  const [workoutType, setWorkoutType] = useState("musculacao");
  const [intensity, setIntensity] = useState("moderado");
  const [durationMin, setDurationMin] = useState(30);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<WorkoutAnalysis | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const createCheckin = useCreateCheckin();
  const createCheckinAll = useCreateCheckinAll();

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const analyzeWorkout = async () => {
    setStep("analyzing");
    setAiError(null);

    try {
      let body: any;

      if (photo && photoPreview) {
        body = { mode: "image", imageBase64: photoPreview };
      } else {
        body = { mode: "manual", workoutType, intensity, durationMin };
      }

      const { data, error } = await supabase.functions.invoke("analyze-workout", { body });

      if (error) throw new Error(error.message || "Erro na análise");
      if (data?.error) throw new Error(data.error);

      setAnalysis({
        workout_type: data.workout_type || workoutType,
        duration_min: data.duration_min || durationMin,
        calories: data.calories || 0,
        heart_rate: data.heart_rate,
        distance_km: data.distance_km,
        steps: data.steps,
        summary: data.summary || "",
      });
      setStep("confirm");
    } catch (err: any) {
      setAiError(err.message || "Erro ao analisar treino");
      setStep("confirm");
      setAnalysis({
        workout_type: workoutType,
        duration_min: durationMin,
        calories: 0,
        summary: "Não foi possível estimar — preencha manualmente.",
      });
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo || !user) return null;
    setUploading(true);
    try {
      const ext = photo.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("checkin-photos").upload(path, photo);
      if (error) throw error;
      const { data } = supabase.storage.from("checkin-photos").getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async (finalData: WorkoutAnalysis) => {
    const proofUrl = await uploadPhoto();
    const hasBatch = activeChallenges && activeChallenges.length > 0;
    const typeLabel = WORKOUT_TYPES.find((w) => w.value === finalData.workout_type)?.label || "Treino";

    const payload = {
      title: typeLabel,
      workoutType: finalData.workout_type,
      durationMin: finalData.duration_min,
      calories: finalData.calories,
      distanceKm: finalData.distance_km,
      steps: finalData.steps,
      note: finalData.summary,
      proofUrl: proofUrl || undefined,
    };

    if (hasBatch) {
      createCheckinAll.mutate(
        { challenges: activeChallenges, ...payload },
        { onSuccess: onDone }
      );
    } else {
      createCheckin.mutate(
        { groupId, ...payload },
        { onSuccess: onDone }
      );
    }
  };

  const isPending = createCheckin.isPending || createCheckinAll.isPending || uploading;

  // --- Step renders ---

  if (step === "analyzing") {
    return <AILoadingAnimation />;
  }

  if (step === "confirm" && analysis) {
    return (
      <CheckinConfirmation
        analysis={analysis}
        aiError={aiError}
        isPending={isPending}
        onBack={() => setStep("photo")}
        onConfirm={handleConfirm}
      />
    );
  }

  const visibleSteps: Step[] = skippedPhoto ? ["type", "intensity", "duration"] : ["photo"];
  const allSteps: Step[] = skippedPhoto ? ["photo", "type", "intensity", "duration"] : ["photo"];

  return (
    <div className="space-y-4">
      {alreadyCheckedIn && step === "photo" && (
        <div className="flex items-start gap-2 rounded-[16px] bg-primary/10 p-3 text-body">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-muted-foreground">
            Hoje já conta como <strong className="text-foreground">1 dia</strong>.
          </p>
        </div>
      )}

      {/* Step indicator */}
      {!["analyzing", "confirm"].includes(step) && (
        <div className="flex items-center gap-1.5 justify-center">
          {visibleSteps.map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all",
                s === step ? "w-6 bg-primary" : i < visibleSteps.indexOf(step) ? "w-3 bg-primary/40" : "w-3 bg-secondary"
              )}
            />
          ))}
        </div>
      )}

      {/* STEP: Photo (first step) */}
      {step === "photo" && (
        <div className="space-y-3">
          <Label className="text-caption font-medium text-muted-foreground">
            Tem um print do treino?
          </Label>
          <p className="text-[12px] text-muted-foreground">
            Envie um print do seu app de fitness e a IA vai extrair os dados automaticamente!
          </p>

          {photoPreview ? (
            <div className="relative rounded-[16px] overflow-hidden">
              <img src={photoPreview} alt="Preview" className="w-full max-h-[60vh] object-contain" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-subtle bg-secondary/50 py-5 text-muted-foreground transition-colors hover:border-primary/40"
              >
                <Camera className="h-5 w-5" />
                Câmera
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-subtle bg-secondary/50 py-5 text-muted-foreground transition-colors hover:border-primary/40"
              >
                <ImagePlus className="h-5 w-5" />
                Galeria
              </button>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
          <input ref={galleryRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />

          {photoPreview ? (
            <Button onClick={analyzeWorkout} className="h-12 w-full rounded-[16px] font-semibold glow-primary">
              Analisar com IA 🤖
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => { setSkippedPhoto(true); setStep("type"); }}
              className="h-12 w-full rounded-[16px]"
            >
              Preencher manualmente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* STEP: Type */}
      {step === "type" && (
        <div className="space-y-3">
          <Label className="text-caption font-medium text-muted-foreground">Que tipo de treino você fez?</Label>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setSkippedPhoto(false); setStep("photo"); }} className="h-12 flex-1 rounded-[16px]">
              <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            <Button onClick={() => setStep("intensity")} className="h-12 flex-1 rounded-[16px] font-semibold">
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP: Intensity */}
      {step === "intensity" && (
        <div className="space-y-3">
          <Label className="text-caption font-medium text-muted-foreground">Qual foi a intensidade?</Label>
          <div className="grid grid-cols-3 gap-2">
            {INTENSITIES.map((int) => (
              <button
                key={int.value}
                type="button"
                onClick={() => setIntensity(int.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[16px] p-4 transition-all",
                  intensity === int.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <span className="text-2xl">{int.emoji}</span>
                <span className="text-sm font-semibold">{int.label}</span>
                <span className="text-[10px] opacity-80">{int.desc}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("type")} className="h-12 flex-1 rounded-[16px]">
              <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            <Button onClick={() => setStep("duration")} className="h-12 flex-1 rounded-[16px] font-semibold">
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP: Duration */}
      {step === "duration" && (
        <div className="space-y-3">
          <Label className="text-caption font-medium text-muted-foreground">Quanto tempo de treino? (minutos)</Label>
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDurationMin(m)}
                className={cn(
                  "rounded-[16px] py-3 text-center font-semibold transition-all",
                  durationMin === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {m} min
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-caption text-muted-foreground whitespace-nowrap">Personalizado:</Label>
            <Input
              type="number"
              min={1}
              max={300}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value) || 1)}
              className="h-10 rounded-[12px] bg-secondary text-center"
            />
            <span className="text-muted-foreground text-sm">min</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("intensity")} className="h-12 flex-1 rounded-[16px]">
              <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            <Button onClick={analyzeWorkout} className="h-12 flex-1 rounded-[16px] font-semibold glow-primary">
              Analisar com IA 🤖
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinFullWizard;
