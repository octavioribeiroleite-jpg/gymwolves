import { useState, useEffect, useRef } from "react";
import { useCreateGroup } from "@/hooks/useGroupData";
import { useActiveGroup } from "@/contexts/ActiveGroupContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trophy, Users2, Camera, CalendarDays, X } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { uploadToStorage } from "@/lib/storage";
import { toast } from "sonner";
import AppScaffold from "@/components/ds/AppScaffold";

const CreateGroup = () => {
  const { user } = useAuth();
  const createGroup = useCreateGroup();
  const { setActiveGroupId } = useActiveGroup();
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state as any;
  const bannerRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"type" | "form" | "scoring">(locState?.step === "confirm" ? "form" : "type");
  const [name, setName] = useState(locState?.name || "");
  const [description, setDescription] = useState(locState?.description || "");
  const [type, setType] = useState<"challenge" | "club">(locState?.type || "challenge");
  const [goalTotal, setGoalTotal] = useState(locState?.goalTotal || "200");
  const [scoringMode, setScoringMode] = useState(locState?.scoringMode || "days_active");
  const [startDate, setStartDate] = useState(locState?.startDate || format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    locState?.endDate || format(new Date(new Date().getFullYear(), 11, 31), "yyyy-MM-dd")
  );
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // If returning from scoring select with a mode
  useEffect(() => {
    if (locState?.scoringMode) {
      setScoringMode(locState.scoringMode);
      setStep("form");
    }
  }, [locState?.scoringMode]);

  const daysDiff = startDate && endDate ? differenceInDays(new Date(endDate), new Date(startDate)) : 0;

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 5MB)");
      return;
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const clearBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerRef.current) bannerRef.current.value = "";
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;

    let bannerUrl: string | undefined;

    if (bannerFile) {
      setUploading(true);
      const path = await uploadToStorage(bannerFile, user.id, "banner_");
      if (!path) {
        toast.error("Erro ao enviar imagem do banner");
        setUploading(false);
        return;
      }
      bannerUrl = path;
      setUploading(false);
    }

    createGroup.mutate(
      {
        name: name.trim(),
        type,
        goalTotal: parseInt(goalTotal),
        ...(type === "challenge" ? { startDate, endDate } : {}),
        bannerUrl,
      },
      {
        onSuccess: (group) => {
          setActiveGroupId(group.id);
          navigate(`/grupos/${group.id}/detalhes`);
        },
      }
    );
  };

  const goToScoring = () => {
    navigate("/pontuacao", {
      state: {
        name,
        description,
        type,
        goalTotal,
        startDate,
        endDate,
        scoringMode,
      },
    });
  };

  // Step 1: Choose type
  if (step === "type") {
    return (
      <AppScaffold title="Criar grupo" subtitle="Escolha o tipo de grupo que deseja criar." showBack hideNav>
        <button
          onClick={() => { setType("challenge"); setStep("form"); }}
          className="w-full text-left rounded-[20px] surface-1 border border-subtle p-5 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-h2">Desafio</h3>
          </div>
          <p className="text-body text-muted-foreground">
            Uma competição única com data de início e término.
          </p>
          <ul className="mt-3 space-y-1.5 text-small text-muted-foreground">
            <li>• Os membros competem dentro do prazo especificado para alcançar o topo do ranking.</li>
            <li>• Isso é bom para estabelecer metas específicas e alcançar objetivos determinados.</li>
          </ul>
        </button>

        <button
          onClick={() => { setType("club"); setStep("form"); }}
          className="w-full text-left rounded-[20px] surface-1 border border-subtle p-5 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-info/10">
              <Users2 className="h-5 w-5 text-info" />
            </div>
            <h3 className="text-h2">Clube</h3>
          </div>
          <p className="text-body text-muted-foreground">
            Uma comunidade fitness contínua que promove responsabilidade.
          </p>
          <ul className="mt-3 space-y-1.5 text-small text-muted-foreground">
            <li>• As classificações são automaticamente rastreadas semanalmente, mensalmente e anualmente.</li>
            <li>• Isso é bom se você regularmente cria desafios e deseja algo mais permanente.</li>
          </ul>
        </button>

        <p className="text-small text-muted-foreground text-center px-2">
          Se você é novo no aplicativo, recomendamos experimentar primeiro com um desafio e depois passar para um clube.
        </p>
      </AppScaffold>
    );
  }

  // Step 2: Form
  return (
    <AppScaffold
      title={type === "challenge" ? "Criar desafio" : "Criar clube"}
      showBack
      hideNav
      headerRight={
        <Button
          variant="ghost"
          className="text-primary font-bold text-body"
          onClick={() => handleCreate()}
          disabled={!name.trim() || createGroup.isPending || uploading}
        >
          {(createGroup.isPending || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
        </Button>
      }
    >
      {/* Banner upload */}
      <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
      <button
        type="button"
        onClick={() => bannerRef.current?.click()}
        className="relative w-full rounded-[20px] surface-1 border border-subtle h-36 flex items-center justify-center overflow-hidden cursor-pointer transition-colors hover:border-primary/30"
      >
        {bannerPreview ? (
          <>
            <img src={bannerPreview} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearBanner(); }}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center z-10"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="text-center">
            <Camera className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
            <span className="text-small text-muted-foreground">Foto do banner</span>
          </div>
        )}
      </button>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-small font-medium text-muted-foreground">
            Nome do {type === "challenge" ? "desafio" : "clube"} *
          </Label>
          <Input
            placeholder="Ex: Matilha 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-[52px] rounded-[16px] border-subtle bg-secondary text-body"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-small font-medium text-muted-foreground">Descrição (opcional)</Label>
          <Textarea
            placeholder="Descreva o desafio..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] rounded-[16px] border-subtle bg-secondary resize-none text-body"
          />
        </div>

        {type === "challenge" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-small font-medium text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Data início
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="h-[52px] rounded-[16px] border-subtle bg-secondary text-body"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-small font-medium text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Data fim
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="h-[52px] rounded-[16px] border-subtle bg-secondary text-body"
                />
              </div>
            </div>
            {daysDiff > 0 && (
              <p className="text-small text-primary font-medium text-center">{daysDiff} dias de duração</p>
            )}
          </>
        )}

        <div className="space-y-2">
          <Label className="text-small font-medium text-muted-foreground">Meta de treinos</Label>
          <Input
            type="number"
            min={1}
            max={999}
            value={goalTotal}
            onChange={(e) => setGoalTotal(e.target.value)}
            required
            className="h-[52px] rounded-[16px] border-subtle bg-secondary text-body"
          />
        </div>

        {/* Scoring mode selector */}
        <button
          type="button"
          onClick={goToScoring}
          className="flex w-full items-center justify-between rounded-[16px] surface-1 border border-subtle px-4 py-3.5 text-left transition-colors hover:bg-surface-2"
        >
          <div>
            <p className="text-small text-muted-foreground">Sistema de pontuação</p>
            <p className="text-body font-medium mt-0.5">
              {scoringMode === "days_active" && "Dias ativos"}
              {scoringMode === "checkin_count" && "Contagem de check-in"}
              {scoringMode === "duration" && "Duração"}
              {scoringMode === "distance" && "Distância"}
              {scoringMode === "steps" && "Passos"}
              {scoringMode === "calories" && "Calorias"}
              {scoringMode === "custom_points" && "Pontos personalizados"}
            </p>
          </div>
          <span className="text-small text-primary font-medium">Alterar</span>
        </button>

        <Button
          onClick={() => handleCreate()}
          className="h-14 w-full rounded-[18px] text-body font-bold glow-primary"
          disabled={!name.trim() || createGroup.isPending || uploading}
        >
          {(createGroup.isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar {type === "challenge" ? "desafio" : "clube"}
        </Button>
      </div>
    </AppScaffold>
  );
};

export default CreateGroup;
