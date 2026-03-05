import { useState, useRef } from "react";
import { useCreateCheckin } from "@/hooks/useCheckins";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

const WORKOUT_TYPES = [
  { value: "musculacao", label: "Musculação", emoji: "🏋️" },
  { value: "corrida", label: "Corrida", emoji: "🏃" },
  { value: "crossfit", label: "Crossfit", emoji: "💪" },
  { value: "natacao", label: "Natação", emoji: "🏊" },
  { value: "ciclismo", label: "Ciclismo", emoji: "🚴" },
  { value: "yoga", label: "Yoga", emoji: "🧘" },
  { value: "luta", label: "Luta", emoji: "🥊" },
  { value: "outro", label: "Outro", emoji: "⚡" },
];

interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  alreadyCheckedIn: boolean;
}

const CheckinDialog = ({ open, onOpenChange, groupId, alreadyCheckedIn }: CheckinDialogProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [title, setTitle] = useState("Treino");
  const [note, setNote] = useState("");
  const [workoutType, setWorkoutType] = useState("musculacao");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createCheckin = useCreateCheckin();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const proofUrl = await uploadPhoto();

    createCheckin.mutate(
      {
        groupId,
        title: title.trim(),
        note: note.trim() || undefined,
        workoutType,
        proofUrl: proofUrl || undefined,
      },
      {
        onSuccess: () => {
          setTitle("Treino");
          setNote("");
          setWorkoutType("musculacao");
          removePhoto();
          onOpenChange(false);
        },
      }
    );
  };

  const isPending = createCheckin.isPending || uploading;

  const formContent = (
    <>
      {alreadyCheckedIn && (
        <div className="flex items-start gap-2 rounded-[16px] bg-primary/10 p-3 text-body">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-muted-foreground">
            Hoje já conta como <strong className="text-foreground">1 dia</strong>. 
            Você pode registrar outro treino, mas não aumenta o score do dia.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workout type */}
        <div className="space-y-2">
          <Label className="text-caption font-medium text-muted-foreground">Tipo de treino</Label>
          <div className="grid grid-cols-4 gap-2">
            {WORKOUT_TYPES.map((wt) => (
              <button
                key={wt.value}
                type="button"
                onClick={() => {
                  setWorkoutType(wt.value);
                  if (title === "Treino" || WORKOUT_TYPES.some((t) => t.label === title)) {
                    setTitle(wt.label);
                  }
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[16px] py-2.5 text-caption font-medium transition-all",
                  workoutType === wt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <span className="text-lg">{wt.emoji}</span>
                <span className="text-[10px] leading-tight">{wt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label className="text-caption font-medium text-muted-foreground">Título *</Label>
          <Input
            placeholder="Ex: Treino de peito"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="h-[52px] rounded-[16px] border-subtle bg-secondary text-body"
          />
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label className="text-caption font-medium text-muted-foreground">Nota (opcional)</Label>
          <Textarea
            placeholder="Como foi o treino?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[70px] rounded-[16px] border-subtle bg-secondary resize-none text-body"
          />
        </div>

        {/* Photo */}
        <div className="space-y-2">
          <Label className="text-caption font-medium text-muted-foreground">Foto (opcional)</Label>
          {photoPreview ? (
            <div className="relative rounded-[16px] overflow-hidden">
              <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-subtle bg-secondary/50 py-6 text-body text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Camera className="h-5 w-5" />
              Adicionar foto do treino
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        <Button
          type="submit"
          className="h-14 w-full rounded-[18px] text-body font-bold glow-primary"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Concluir treino 💪
        </Button>
      </form>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-h1">Registrar treino</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6 space-y-4">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-w-sm rounded-[24px] border-subtle surface-2 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-h1">Registrar treino</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default CheckinDialog;
