import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = 0 | 1 | 2 | 3 | 4;

const NeonEyes = () => (
  <svg width="280" height="100" viewBox="0 0 280 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left eye */}
    <path
      d="M20 50 Q70 15 120 50 Q70 85 20 50Z"
      stroke="#22C55E"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="none"
    />
    <line x1="70" y1="32" x2="70" y2="68" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />

    {/* Right eye */}
    <path
      d="M160 50 Q210 15 260 50 Q210 85 160 50Z"
      stroke="#22C55E"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="none"
    />
    <line x1="210" y1="32" x2="210" y2="68" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<Phase>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 2600),
      setTimeout(() => setPhase(4), 3400),
      setTimeout(() => onFinish(), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  const getScale = () => {
    if (phase === 0) return 0.5;
    if (phase === 1) return 1;
    if (phase === 2) return 0.3;
    if (phase >= 3) return 1.2;
    return 1;
  };

  const getOpacity = () => {
    if (phase === 0) return 0;
    if (phase === 1) return 1;
    if (phase === 2) return 0;
    if (phase >= 3) return 0;
    return 1;
  };

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ backgroundColor: "#F3F4F6" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Ambient glow */}
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 320,
              height: 160,
              background:
                "radial-gradient(ellipse, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 40%, transparent 70%)",
            }}
            animate={{
              opacity: phase === 1 ? [0.5, 1, 0.5] : 0,
              scale: phase === 1 ? 1.5 : 0.5,
            }}
            transition={{
              opacity: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.6, ease: "easeOut" },
            }}
          />

          {/* Eyes container with zoom + blink */}
          <motion.div
            className="relative z-10"
            style={{
              filter:
                "drop-shadow(0 0 12px rgba(34,197,94,0.6)) drop-shadow(0 0 30px rgba(34,197,94,0.3))",
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: getScale(),
              opacity: getOpacity(),
              scaleY:
                phase === 1
                  ? [1, 0.05, 1, 1]
                  : 1,
            }}
            transition={{
              scale: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.6, ease: "easeInOut" },
              scaleY: {
                duration: 0.6,
                delay: 0.3,
                ease: "easeInOut",
                times: [0, 0.35, 0.65, 1],
              },
            }}
          >
            <NeonEyes />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
