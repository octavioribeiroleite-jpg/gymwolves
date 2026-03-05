import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import wolfEyes from "@/assets/wolf-eyes.png";

type Phase = 0 | 1 | 2 | 3 | 4;
// 0: empty + glow appears
// 1: eyes open (clipPath expands)
// 2: eyes open + blink
// 3: eyes close + fade
// 4: done

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<Phase>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => onFinish(), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  // clipPath inset values per phase
  const getClipPath = () => {
    if (phase === 0) return "inset(48% 10% 48% 10%)";
    if (phase === 1) return "inset(0% 0% 0% 0%)";
    if (phase === 2) return "inset(0% 0% 0% 0%)";
    if (phase >= 3) return "inset(48% 10% 48% 10%)";
    return "inset(48% 10% 48% 10%)";
  };

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ backgroundColor: "#F3F4F6" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase >= 3 ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Ambient glow */}
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 320,
              height: 160,
              background:
                "radial-gradient(ellipse, hsl(142 71% 45% / 0.15) 0%, hsl(142 71% 45% / 0.05) 40%, transparent 70%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: phase >= 1 ? [0.6, 1, 0.6] : 0,
              scale: phase >= 1 ? 1.5 : 0.5,
            }}
            transition={{
              opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.8, ease: "easeOut" },
            }}
          />

          {/* Wolf eyes image with clipPath animation */}
          <motion.div
            className="relative z-10"
            style={{
              filter:
                "drop-shadow(0 0 20px hsl(142 71% 45% / 0.4)) drop-shadow(0 0 40px hsl(142 71% 45% / 0.2))",
            }}
            initial={{ clipPath: "inset(48% 10% 48% 10%)" }}
            animate={{ clipPath: getClipPath() }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Blink animation layer */}
            <motion.div
              animate={
                phase === 2
                  ? {
                      clipPath: [
                        "inset(0% 0% 0% 0%)",
                        "inset(38% 5% 38% 5%)",
                        "inset(0% 0% 0% 0%)",
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: "easeInOut",
              }}
            >
              <img
                src={wolfEyes}
                alt="Wolf Eyes"
                className="w-[340px] max-w-[80vw] object-contain"
                draggable={false}
              />
            </motion.div>
          </motion.div>

          {/* Subtle scan line effect during open */}
          {phase >= 1 && phase < 3 && (
            <motion.div
              className="pointer-events-none absolute z-20"
              style={{
                width: 360,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent 0%, hsl(142 71% 45% / 0.3) 50%, transparent 100%)",
              }}
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: [0, 0.6, 0], y: [-40, 40] }}
              transition={{
                duration: 1.2,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
