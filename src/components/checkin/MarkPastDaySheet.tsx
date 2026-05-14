import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, ClipboardList, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateCheckin, useCreateCheckinAll } from "@/hooks/useCheckins";
import { ActiveChallenge } from "@/hooks/useUserChallenges";
import { dispatchCheckinOpen } from "@/hooks/useCheckinEvent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface Props {
  date: Date | null;
  onClose: () => void;
  groupId?: string;
  activeChallenges?: ActiveChallenge[];
}

const MarkPastDaySheet = ({ date, onClose, groupId, activeChallenges }: Props) => {
  const isMobile = useIsMobile();
  const createCheckin = useCreateCheckin();
  const createCheckinAll = useCreateCheckinAll();
  const isPending = createCheckin.isPending || createCheckinAll.isPending;

  const open = !!date;
  const dateLabel = date ? format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }) : "";

  const handleQuick = () => {
    if (!date) return;
    const onSuccess = () => onClose();
    if (activeChallenges && activeChallenges.length > 0) {
      createCheckinAll.mutate(
        {
          challenges: activeChallenges,
          title: "Treino",
          workoutType: "musculacao",
          checkinDate: date,
        },
        { onSuccess }
      );
    } else if (groupId) {
      createCheckin.mutate(
        {
          groupId,
          title: "Treino",
          workoutType: "musculacao",
          checkinDate: date,
        },
        { onSuccess }
      );
    }
  };

  const handleDetailed = () => {
    if (!date) return;
    onClose();
    // Pequeno delay para o sheet fechar antes do dialog abrir
    setTimeout(() => dispatchCheckinOpen({ date }), 150);
  };

  const body = (
    <div className="space-y-3 px-4 pb-6">
      <Button
        onClick={handleQuick}
        disabled={isPending}
        className="h-14 w-full rounded-[18px] text-body font-bold"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-5 w-5" />
        )}
        Marcar como ido
      </Button>
      <Button
        onClick={handleDetailed}
        disabled={isPending}
        variant="outline"
        className="h-12 w-full rounded-[16px] font-semibold"
      >
        <ClipboardList className="mr-2 h-4 w-4" />
        Detalhar treino
      </Button>
      <button
        onClick={onClose}
        disabled={isPending}
        className="w-full text-center text-sm text-muted-foreground py-2"
      >
        Cancelar
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="capitalize">Marcar treino</DrawerTitle>
            <DrawerDescription className="capitalize">{dateLabel}</DrawerDescription>
          </DrawerHeader>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="mx-4 max-w-sm rounded-[24px]">
        <DialogHeader>
          <DialogTitle>Marcar treino</DialogTitle>
          <DialogDescription className="capitalize">{dateLabel}</DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
};

export default MarkPastDaySheet;
