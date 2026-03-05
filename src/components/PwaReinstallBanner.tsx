import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Sparkles, Copy, Check } from "lucide-react";
import logo from "@/assets/logo.png";

const APP_ICON_VERSION = "2";
const STORAGE_KEYS = {
  iconVersion: "gymwolves_icon_version",
  snoozedAt: "gymwolves_reinstall_snoozed_at",
};
const SNOOZE_DURATION = 24 * 60 * 60 * 1000;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function PwaReinstallBanner() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shouldShow = useCallback(() => {
    if (!isStandalone()) return false;
    if (localStorage.getItem(STORAGE_KEYS.iconVersion) === APP_ICON_VERSION) return false;
    const snoozedAt = localStorage.getItem(STORAGE_KEYS.snoozedAt);
    if (snoozedAt && Date.now() - parseInt(snoozedAt, 10) < SNOOZE_DURATION) return false;
    return true;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (shouldShow()) setOpen(true);
    }, 1500);
    return () => clearTimeout(t);
  }, [shouldShow]);

  const handleDone = () => {
    localStorage.setItem(STORAGE_KEYS.iconVersion, APP_ICON_VERSION);
    setOpen(false);
  };

  const handleSnooze = () => {
    localStorage.setItem(STORAGE_KEYS.snoozedAt, String(Date.now()));
    setOpen(false);
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 80) handleDismiss();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const ios = isIos();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-[9998] backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={handleDismiss}
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-[9999] mx-auto max-w-lg"
          >
            <div className="relative rounded-t-[24px] px-5 pb-8 pt-4 surface-2 border-t border-subtle">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

              <button
                onClick={handleDismiss}
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Logo */}
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={logo}
                    alt="GymWoves"
                    className="h-16 w-16 object-contain"
                    style={{ filter: "drop-shadow(0 0 12px hsl(142 71% 45% / 0.25))" }}
                  />
                  <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-primary animate-pulse" />
                </div>
              </div>

              <h2 className="mt-3 text-center text-h2">Nova identidade visual!</h2>
              <p className="mt-1.5 text-center text-subtitle text-muted-foreground">
                Reinstale o app para atualizar o ícone na tela inicial.
              </p>

              {/* Steps */}
              <div className="mt-4 rounded-[16px] bg-secondary/50 p-4 space-y-2.5">
                {ios ? (
                  <>
                    <Step n={1}>Mantenha pressionado o ícone do <strong className="text-foreground">GymWoves</strong> na tela inicial</Step>
                    <Step n={2}>Toque em <strong className="text-foreground">"Remover App"</strong> → <strong className="text-foreground">"Apagar App"</strong></Step>
                    <Step n={3}>Abra o Safari e acesse o site novamente</Step>
                    <Step n={4}>Toque em Compartilhar → <strong className="text-foreground">"Adicionar à Tela de Início"</strong></Step>
                  </>
                ) : (
                  <>
                    <Step n={1}>Mantenha pressionado o ícone do <strong className="text-foreground">GymWoves</strong></Step>
                    <Step n={2}>Toque em <strong className="text-foreground">"Desinstalar"</strong></Step>
                    <Step n={3}>Abra o navegador e acesse o site novamente</Step>
                    <Step n={4}>Toque em <strong className="text-foreground">"Instalar aplicativo"</strong> no menu do navegador</Step>
                  </>
                )}
              </div>

              {/* Copy URL */}
              <button
                onClick={handleCopyUrl}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] border border-subtle py-2.5 text-caption text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? "Link copiado!" : "Copiar link do app"}
              </button>

              <button
                onClick={handleDone}
                className="mt-4 h-14 w-full rounded-[18px] text-body font-bold text-primary-foreground bg-primary glow-primary transition-all active:scale-[0.98]"
              >
                JÁ REINSTALEI
              </button>

              <button
                onClick={handleSnooze}
                className="mt-3 w-full text-center text-subtitle font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Lembrar depois
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-caption font-bold text-primary">{n}</span>
      <p className="text-body text-muted-foreground">{children}</p>
    </div>
  );
}
