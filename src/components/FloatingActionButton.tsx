import { Plus } from "lucide-react";

interface FABProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FABProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg glow-primary transition-all active:scale-90"
      aria-label="Registrar treino"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </button>
  );
};

export default FloatingActionButton;
