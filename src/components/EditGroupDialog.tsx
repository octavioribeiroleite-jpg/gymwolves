import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUpdateGroup } from "@/hooks/useGroupData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const SCORING_OPTIONS = [
  { value: "days_active", label: "Dias ativos" },
  { value: "checkin_count", label: "Check-ins" },
  { value: "duration", label: "Duração" },
  { value: "distance", label: "Distância" },
  { value: "steps", label: "Passos" },
  { value: "calories", label: "Calorias" },
];

interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: any;
}

const EditGroupDialog = ({ open, onOpenChange, group }: EditGroupDialogProps) => {
  const isMobile = useIsMobile();
  const updateGroup = useUpdateGroup();

  const [name, setName] = useState("");
  const [goalTotal, setGoalTotal] = useState(200);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [scoringMode, setScoringMode] = useState("days_active");

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setGoalTotal(group.goal_total || 200);
      setStartDate(group.start_date ? new Date(group.start_date) : undefined);
      setEndDate(group.end_date ? new Date(group.end_date) : undefined);
      setScoringMode(group.scoring_mode || "days_active");
    }
  }, [group]);

  const handleSave = () => {
    if (!group?.id || !name.trim()) return;
    updateGroup.mutate(
      {
        groupId: group.id,
        updates: {
          name: name.trim(),
          goal_total: goalTotal,
          start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
          end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
          scoring_mode: scoringMode,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const formContent = (
    <div className="space-y-5 p-4">
      <div className="space-y-2">
        <Label className="text-[13px] font-medium">Nome do grupo</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-[14px]" />
      </div>

      <div className="space-y-2">
        <Label className="text-[13px] font-medium">Meta de treinos</Label>
        <Input
          type="number"
          value={goalTotal}
          onChange={(e) => setGoalTotal(Number(e.target.value))}
          className="rounded-[14px]"
          min={1}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start rounded-[14px] text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yy") : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={ptBR} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-medium">Fim</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start rounded-[14px] text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yy") : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={ptBR} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[13px] font-medium">Sistema de pontuação</Label>
        <Select value={scoringMode} onValueChange={setScoringMode}>
          <SelectTrigger className="rounded-[14px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCORING_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} disabled={updateGroup.isPending || !name.trim()} className="w-full rounded-[14px] h-12">
        {updateGroup.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Salvar alterações
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar grupo</DrawerTitle>
          </DrawerHeader>
          {formContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[20px]">
        <DialogHeader>
          <DialogTitle>Editar grupo</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDialog;
