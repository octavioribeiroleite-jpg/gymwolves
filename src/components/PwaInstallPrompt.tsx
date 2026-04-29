import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Zap, Smartphone, Wifi, Share, PlusSquare } from "lucide-react";
import logo from "@/assets/logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEYS = {
  installed: "gymwolves_pwa_installed",
  snoozedAt: "gymwolves_pwa_snoozed_at",
};
const SESSION_KEY = "gymwolves_pwa_dismiss_count";
const SNOOZE_DURATION = 24 * 60 * 60 * 1000;
const REAPPEAR_DELAY = 4 * 60 * 1000;
const MAX_DISMISSALS = 3;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function getSessionDismissCount(): number {
  return parseInt(sessionStorage.getItem(SESSION_KEY) || "0", 10);
}

function setSessionDismissCount(n: number) {
  sessionStorage.setItem(SESSION_KEY, String(n));
}

export default function PwaInstallPrompt() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"android" | "ios">(isIos() ? "ios" : "android");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldShow = useCallback(() => {
    if (isStandalone()) return false;
    if (localStorage.getItem(STORAGE_KEYS.installed) === "true") return false;
    const snoozedAt = localStorage.getItem(STORAGE_KEYS.snoozedAt);
    if (snoozedAt && Date.now() - parseInt(snoozedAt, 10) < SNOOZE_DURATION) return false;
    if (getSessionDismissCount() >= MAX_DISMISSALS) return false;
    return true;
  }, []);

  const scheduleReappear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (shouldShow()) setOpen(true);
    }, REAPPEAR_DELAY);
  }, [shouldShow]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (shouldShow()) setOpen(true);
    }, 800);
    return () => clearTimeout(t);
  }, [shouldShow]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem(STORAGE_KEYS.installed, "true");
        if (timerRef.current) clearTimeout(timerRef.current);
        setOpen(false);
        return;
      }
    }
    handleDismiss();
  };

  const handleSnooze = () => {
    localStorage.setItem(STORAGE_KEYS.snoozedAt, String(Date.now()));
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  };

  const handleDismiss = () => {
    const count = getSessionDismissCount() + 1;
    setSessionDismissCount(count);
    setOpen(false);
    if (count < MAX_DISMISSALS) scheduleReappear();
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 80) handleDismiss();
  };

  const ios = isIos();
  const showNativeInstall = !ios && !!deferredPrompt;

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
                <img
                  src={logo}
                  alt="GymWolves"
                  className="h-16 w-16 object-contain"
                  style={{ filter: "drop-shadow(0 0 12px hsl(142 71% 45% / 0.25))" }}
                />
              </div>

              <h2 className="mt-3 text-center text-h2">Instalar o GymWolves</h2>
              <p className="mt-1.5 text-center text-subtitle text-muted-foreground">
                Instale para abrir mais rápido, usar em tela cheia e receber melhorias.
              </p>

              {/* Chips */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  { icon: Zap, label: "Mais rápido" },
                  { icon: Smartphone, label: "Tela cheia" },
                  { icon: Wifi, label: "Funciona offline" },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 px-3 py-1.5 text-caption font-medium text-primary bg-primary/5"
                  >
                    <chip.icon className="h-3.5 w-3.5" />
                    {chip.label}
                  </span>
                ))}
              </div>

              {/* Tabs */}
              <div className="mt-4 flex rounded-[16px] bg-secondary p-1">
                <button
                  onClick={() => setTab("android")}
                  className={`flex-1 rounded-xl py-2 text-caption font-medium transition-all ${tab === "android" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  Android
                </button>
                <button
                  onClick={() => setTab("ios")}
                  className={`flex-1 rounded-xl py-2 text-caption font-medium transition-all ${tab === "ios" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  iPhone
                </button>
              </div>

              {/* Content */}
              <div className="mt-3 rounded-[16px] bg-secondary/50 p-4 space-y-2.5">
                {tab === "android" ? (
                  showNativeInstall ? (
                    <p className="text-body text-muted-foreground">
                      Toque em <strong className="text-foreground">"Instalar agora"</strong> abaixo para adicionar à tela inicial.
                    </p>
                  ) : (
                    <>
                      <Step n={1}>Toque no menu do navegador <strong className="text-foreground">(⋮)</strong></Step>
                      <Step n={2}>Selecione <strong className="text-foreground">"Instalar aplicativo"</strong></Step>
                    </>
                  )
                ) : (
                  <>
                    <Step n={1}>Toque em <Share className="inline h-4 w-4 text-primary" /> <strong className="text-foreground">Compartilhar</strong></Step>
                    <Step n={2}>Toque em <PlusSquare className="inline h-4 w-4 text-primary" /> <strong className="text-foreground">Adicionar à Tela de Início</strong></Step>
                    <Step n={3}>Confirme em <strong className="text-foreground">Adicionar</strong></Step>
                  </>
                )}
              </div>

              <button
                onClick={handleInstall}
                className="mt-5 h-14 w-full rounded-[18px] text-body font-bold text-primary-foreground bg-primary glow-primary transition-all active:scale-[0.98]"
              >
                {showNativeInstall ? "INSTALAR AGORA" : "ENTENDI"}
              </button>

              <button
                onClick={handleSnooze}
                className="mt-3 w-full text-center text-subtitle font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Agora não
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
