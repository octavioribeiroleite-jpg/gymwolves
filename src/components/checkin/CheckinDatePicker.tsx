import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const CheckinDatePicker = ({ selectedDate, onDateChange }: Props) => {
  const today = isToday(selectedDate);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start rounded-[16px] bg-secondary border-0 text-left font-medium h-11",
            today ? "text-muted-foreground" : "text-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {today
            ? "Hoje"
            : format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          disabled={(date) => date > new Date()}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};

export default CheckinDatePicker;
