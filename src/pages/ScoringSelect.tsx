import { useNavigate, useLocation } from "react-router-dom";
import { CalendarCheck, Hash, Clock, MapPin, Footprints, Flame, Star, ChevronRight } from "lucide-react";
import AppScaffold from "@/components/ds/AppScaffold";
import { cn } from "@/lib/utils";

const SCORING_MODES = [
  {
    value: "days_active",
    icon: CalendarCheck,
    title: "Dias ativos",
    description: "A maioria dos dias com pelo menos um check-in",
  },
  {
    value: "custom_points",
    icon: Star,
    title: "Pontos personalizados",
    description: "Sistema de pontuação personalizável e baseado em atividades",
  },
  {
    value: "checkin_count",
    icon: Hash,
    title: "Contagem de check-in",
    description: "Maior número de check-ins",
  },
  {
    value: "duration",
    icon: Clock,
    title: "Duração",
    description: "A maior parte do tempo gasto ativo",
  },
  {
    value: "distance",
    icon: MapPin,
    title: "Distância",
    description: "Maior distância percorrida",
  },
  {
    value: "steps",
    icon: Footprints,
    title: "Passos",
    description: "A maioria dos passos dados",
  },
  {
    value: "calories",
    icon: Flame,
    title: "Calorias",
    description: "Mais calorias queimadas",
  },
];

const ScoringSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;

  const handleSelect = (mode: string) => {
    // Navigate back to create with scoring mode selected
    navigate("/grupos/criar", {
      state: { ...state, scoringMode: mode, step: "confirm" },
    });
  };

  return (
    <AppScaffold title="Sistema de pontuação" subtitle="Escolha como a pontuação será calculada." showBack hideNav>
      <div className="space-y-2">
        {SCORING_MODES.map((mode) => (
          <button
            key={mode.value}
            onClick={() => handleSelect(mode.value)}
            className={cn(
              "flex w-full items-center gap-4 rounded-[20px] surface-1 border border-subtle p-4 text-left transition-all active:scale-[0.98]",
              state?.scoringMode === mode.value && "border-primary/40 bg-primary/5"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <mode.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-body font-bold">{mode.title}</h3>
              <p className="text-small text-muted-foreground mt-0.5">{mode.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </AppScaffold>
  );
};

export default ScoringSelect;
