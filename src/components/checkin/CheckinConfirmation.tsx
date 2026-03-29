import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronLeft, AlertTriangle, Flame, Clock, Heart, MapPin, Footprints, Camera, ImagePlus, X } from "lucide-react";
import type { WorkoutAnalysis } from "./CheckinFullWizard";

interface Props {
  analysis: WorkoutAnalysis;
  aiError: string | null;
  isPending: boolean;
  onBack: () => void;
  onConfirm: (data: WorkoutAnalysis, feedPhoto?: File, customCaption?: string) => void;
}

const CheckinConfirmation = ({ analysis, aiError, isPending, onBack, onConfirm }: Props) => {
  const [data, setData] = useState<WorkoutAnalysis>({ ...analysis });
  const [feedPhoto, setFeedPhoto] = useState<File | null>(null);
  const [feedPhotoPreview, setFeedPhotoPreview] = useState<string | null>(null);
  const [customCaption, setCustomCaption] = useState("");
  const feedCameraRef = useRef<HTMLInputElement>(null);
  const feedGalleryRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof WorkoutAnalysis, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFeedPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setFeedPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeFeedPhoto = () => {
    setFeedPhoto(null);
    setFeedPhotoPreview(null);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {aiError && (
        <div className="flex items-start gap-2 rounded-[16px] bg-destructive/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-[13px] text-muted-foreground">{aiError}</p>
        </div>
      )}

      {data.summary && !aiError && (
        <div className="rounded-[16px] bg-primary/10 p-3">
          <p className="text-[13px] text-foreground">{data.summary}</p>
        </div>
      )}

      {/* Editable metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calories */}
        <div className="rounded-[16px] bg-secondary p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Flame className="h-4 w-4 text-destructive" />
            <Label className="text-[11px] font-medium">Calorias</Label>
          </div>
          <Input
            type="number"
            value={data.calories || ""}
            onChange={(e) => update("calories", Number(e.target.value) || 0)}
            className="h-9 rounded-[10px] border-0 bg-background/50 text-center font-semibold"
          />
          <span className="text-[10px] text-muted-foreground block text-center">kcal</span>
        </div>

        {/* Duration */}
        <div className="rounded-[16px] bg-secondary p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <Label className="text-[11px] font-medium">Duração</Label>
          </div>
          <Input
            type="number"
            value={data.duration_min || ""}
            onChange={(e) => update("duration_min", Number(e.target.value) || 0)}
            className="h-9 rounded-[10px] border-0 bg-background/50 text-center font-semibold"
          />
          <span className="text-[10px] text-muted-foreground block text-center">min</span>
        </div>

        {/* Heart Rate */}
        {data.heart_rate !== undefined && data.heart_rate > 0 && (
          <div className="rounded-[16px] bg-secondary p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="h-4 w-4 text-destructive" />
              <Label className="text-[11px] font-medium">Freq. cardíaca</Label>
            </div>
            <Input
              type="number"
              value={data.heart_rate || ""}
              onChange={(e) => update("heart_rate", Number(e.target.value) || 0)}
              className="h-9 rounded-[10px] border-0 bg-background/50 text-center font-semibold"
            />
            <span className="text-[10px] text-muted-foreground block text-center">bpm</span>
          </div>
        )}

        {/* Distance */}
        {data.distance_km !== undefined && data.distance_km > 0 && (
          <div className="rounded-[16px] bg-secondary p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <Label className="text-[11px] font-medium">Distância</Label>
            </div>
            <Input
              type="number"
              step="0.1"
              value={data.distance_km || ""}
              onChange={(e) => update("distance_km", Number(e.target.value) || 0)}
              className="h-9 rounded-[10px] border-0 bg-background/50 text-center font-semibold"
            />
            <span className="text-[10px] text-muted-foreground block text-center">km</span>
          </div>
        )}

        {/* Steps */}
        {data.steps !== undefined && data.steps > 0 && (
          <div className="rounded-[16px] bg-secondary p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Footprints className="h-4 w-4 text-primary" />
              <Label className="text-[11px] font-medium">Passos</Label>
            </div>
            <Input
              type="number"
              value={data.steps || ""}
              onChange={(e) => update("steps", Number(e.target.value) || 0)}
              className="h-9 rounded-[10px] border-0 bg-background/50 text-center font-semibold"
            />
          </div>
        )}
      </div>

      {/* Feed photo section */}
      <div className="space-y-2">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          📸 Foto para o feed (opcional)
        </Label>
        {feedPhotoPreview ? (
          <div className="relative rounded-[16px] overflow-hidden bg-secondary">
            <img src={feedPhotoPreview} alt="Feed" className="w-full max-h-[40vh] object-contain" />
            <button
              type="button"
              onClick={removeFeedPhoto}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => feedCameraRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-subtle bg-secondary/50 py-4 text-muted-foreground text-[13px] transition-colors hover:border-primary/40"
            >
              <Camera className="h-4 w-4" /> Câmera
            </button>
            <button
              type="button"
              onClick={() => feedGalleryRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-subtle bg-secondary/50 py-4 text-muted-foreground text-[13px] transition-colors hover:border-primary/40"
            >
              <ImagePlus className="h-4 w-4" /> Galeria
            </button>
          </div>
        )}
        <input ref={feedCameraRef} type="file" accept="image/*" capture="environment" onChange={handleFeedPhoto} className="hidden" />
        <input ref={feedGalleryRef} type="file" accept="image/*" onChange={handleFeedPhoto} className="hidden" />

        {/* Caption */}
        <Textarea
          value={customCaption}
          onChange={(e) => setCustomCaption(e.target.value)}
          placeholder="Escreva uma legenda... (opcional)"
          className="rounded-[16px] border-subtle bg-secondary/50 resize-none min-h-[60px]"
          maxLength={300}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 rounded-[16px]">
          <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
        </Button>
        <Button
          onClick={() => onConfirm(data, feedPhoto || undefined, customCaption.trim() || undefined)}
          className="h-12 flex-1 rounded-[16px] font-bold glow-primary"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar 💪
        </Button>
      </div>
    </motion.div>
  );
};

export default CheckinConfirmation;
