import { useNavigate } from "react-router-dom";
import { Plus, LogIn } from "lucide-react";
import logo from "@/assets/logo.png";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background px-5">
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center pt-12 pb-8">
        <h1 className="text-h1 mb-2">Começar</h1>
        <p className="text-subtitle text-muted-foreground text-center">
          Estamos felizes que você esteja aqui.
        </p>

        {/* Illustration */}
        <div className="my-10 flex items-center justify-center">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(142 71% 45% / 0.08) 0%, transparent 70%)",
                transform: "scale(1.5)",
              }}
            />
            <img
              src={logo}
              alt="GYM WOLVES"
              className="relative h-32 w-32 object-contain"
              style={{ filter: "drop-shadow(0 0 24px hsl(142 71% 45% / 0.3))" }}
            />
          </div>
        </div>
      </div>

      {/* Bottom card */}
      <div className="pb-8 space-y-3">
        <button
          onClick={() => navigate("/grupos/criar")}
          className="flex w-full items-start gap-4 rounded-[20px] surface-1 border border-subtle p-5 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-body font-bold">Criar um grupo</h3>
            <p className="text-small text-muted-foreground mt-0.5">
              Quero criar um desafio ou um clube e convidar outras pessoas para participar.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/grupos/entrar")}
          className="flex w-full items-start gap-4 rounded-[20px] surface-1 border border-subtle p-5 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-info/10">
            <LogIn className="h-5 w-5 text-info" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-body font-bold">Entrar em um grupo</h3>
            <p className="text-small text-muted-foreground mt-0.5">
              Alguém me convidou e quero entrar em um grupo existente.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
