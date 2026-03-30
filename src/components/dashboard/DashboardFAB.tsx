import { useState, useEffect, useRef } from "react";
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
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current + 10) {
        setVisible(false);
      } else if (currentY < lastScrollY.current - 10) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAction = () => {
    setOpen(false);
    onCheckin();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div className="fixed bottom-28 right-4 z-50 flex flex-col items-end gap-2">
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

      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-[76px] right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg glow-primary transition-all active:scale-90 ${
          open ? "rotate-45" : ""
        } ${visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
        style={{ transitionDuration: "300ms" }}
        aria-label="Ações rápidas"
      >
        <Plus className="h-5 w-5 transition-transform" strokeWidth={2.5} />
      </button>
    </>
  );
};

export default DashboardFAB;
