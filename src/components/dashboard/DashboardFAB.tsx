import { useState } from "react";
import { Plus, Dumbbell, Zap, MapPin, Footprints } from "lucide-react";

interface DashboardFABProps {
  onCheckin: () => void;
}

const actions = [
  { icon: Dumbbell, label: "Registrar treino", key: "treino" },
  { icon: Zap, label: "Check-in rápido", key: "rapido" },
  { icon: MapPin, label: "Registrar corrida", key: "corrida" },
  { icon: Footprints, label: "Registrar caminhada", key: "caminhada" },
];

const DashboardFAB = ({ onCheckin }: DashboardFABProps) => {
  const [open, setOpen] = useState(false);

  const handleAction = () => {
    setOpen(false);
    onCheckin();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Action menu */}
      {open && (
        <div className="fixed bottom-[140px] right-4 z-50 flex flex-col items-end gap-2">
          {actions.map((a) => (
            <button
              key={a.key}
              onClick={handleAction}
              className="flex items-center gap-3 rounded-2xl surface-1 border border-subtle px-4 py-3 shadow-lg transition-all hover:border-primary/20"
            >
              <a.icon className="h-5 w-5 text-primary" strokeWidth={2} />
              <span className="text-[14px] font-medium whitespace-nowrap">{a.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-[88px] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg glow-primary transition-all active:scale-90 ${
          open ? "rotate-45" : ""
        }`}
        aria-label="Ações rápidas"
      >
        <Plus className="h-6 w-6 transition-transform" strokeWidth={2.5} />
      </button>
    </>
  );
};

export default DashboardFAB;
