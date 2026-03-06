import { useState, useRef } from "react";
import { useCreateCheckin, useCreateCheckinAll } from "@/hooks/useCheckins";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ActiveChallenge } from "@/hooks/useUserChallenges";
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
import { cn } from "@/lib/utils";
import { Zap, ClipboardList, ArrowLeft } from "lucide-react";
import CheckinQuickMode from "@/components/checkin/CheckinQuickMode";
import CheckinFullWizard from "@/components/checkin/CheckinFullWizard";

interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string;
  alreadyCheckedIn: boolean;
  activeChallenges?: ActiveChallenge[];
}

type Mode = null | "quick" | "full";

const CheckinDialog = ({ open, onOpenChange, groupId, alreadyCheckedIn, activeChallenges }: CheckinDialogProps) => {
  const resolvedGroupId = groupId || activeChallenges?.[0]?.groupId || "";
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<Mode>(null);

  const handleClose = (v: boolean) => {
    if (!v) setMode(null);
    onOpenChange(v);
  };

  const modeSelector = (
    <div className="space-y-3">
      <button
        onClick={() => setMode("quick")}
        className="flex w-full items-center gap-4 rounded-[18px] border-2 border-subtle bg-secondary/50 p-4 text-left transition-all hover:border-primary/40 active:scale-[0.98]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Check-in Rápido</p>
          <p className="text-[13px] text-muted-foreground">Só marcar presença no treino</p>
        </div>
      </button>

      <button
        onClick={() => setMode("full")}
        className="flex w-full items-center gap-4 rounded-[18px] border-2 border-subtle bg-secondary/50 p-4 text-left transition-all hover:border-primary/40 active:scale-[0.98]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Modo Completo</p>
          <p className="text-[13px] text-muted-foreground">Detalhar treino com IA e calorias</p>
        </div>
      </button>
    </div>
  );

  const content = (
    <div className="space-y-4">
      {mode === null && modeSelector}
      {mode === "quick" && (
        <CheckinQuickMode
          groupId={groupId}
          alreadyCheckedIn={alreadyCheckedIn}
          activeChallenges={activeChallenges}
          onBack={() => setMode(null)}
          onDone={() => handleClose(false)}
        />
      )}
      {mode === "full" && (
        <CheckinFullWizard
          groupId={groupId}
          alreadyCheckedIn={alreadyCheckedIn}
          activeChallenges={activeChallenges}
          onBack={() => setMode(null)}
          onDone={() => handleClose(false)}
        />
      )}
    </div>
  );

  const title = mode === "quick" ? "Check-in Rápido" : mode === "full" ? "Modo Completo" : "Registrar treino";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-2">
              {mode && (
                <button onClick={() => setMode(null)} className="rounded-full p-1 hover:bg-secondary">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
              <DrawerTitle className="text-h1">{title}</DrawerTitle>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="mx-4 max-w-sm rounded-[24px] border-subtle surface-2 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {mode && (
              <button onClick={() => setMode(null)} className="rounded-full p-1 hover:bg-secondary">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <DialogTitle className="text-h1">{title}</DialogTitle>
          </div>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default CheckinDialog;
