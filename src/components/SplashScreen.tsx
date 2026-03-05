import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

function Particles({ intense }: { intense?: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: intense ? 24 : 10 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: 60 + Math.random() * 40,
        size: Math.random() * 2.5 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 1,
      })),
    [intense]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "hsl(142 71% 45% / 0.4)",
            boxShadow: `0 0 ${p.size * 2}px hsl(142 71% 45% / 0.2)`,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.5, 0], y: [0, -40 - Math.random() * 30] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── SVG Wolf Face ─── */
function WolfFace({ visible }: { visible: boolean }) {
  // Stroke-dasharray animation for drawing lines
  const drawTransition = (delay: number, duration = 0.8) => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { delay, duration, ease: "easeInOut" },
    },
  });

  // Eye open animation (scaleY from 0 to 1)
  const eyeOpenVariants = {
    hidden: { scaleY: 0.05, opacity: 0 },
    visible: {
      scaleY: 1,
      opacity: 1,
      transition: { delay: 0.3, duration: 0.5, ease: "easeOut" },
    },
  };

  // Slow blink at 0.8-1.4s
  const blinkVariants = {
    hidden: {},
    visible: {
      scaleY: [1, 0.05, 1],
      transition: { delay: 1.0, duration: 0.6, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      className="absolute left-1/2 z-10 -translate-x-1/2"
      style={{ top: "28%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <svg
        width="220"
        height="200"
        viewBox="0 0 220 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 0 12px hsl(142 71% 45% / 0.4)) drop-shadow(0 0 30px hsl(142 71% 45% / 0.15))",
        }}
      >
        {/* ── Left Eye ── */}
        <g transform="translate(45, 70)">
          <motion.g
            style={{ originX: "50%", originY: "50%" }}
            variants={eyeOpenVariants}
            initial="hidden"
            animate={visible ? "visible" : "hidden"}
          >
            <motion.g
              style={{ originX: "50%", originY: "50%" }}
              variants={blinkVariants}
              initial="hidden"
              animate={visible ? "visible" : "hidden"}
            >
              {/* Eye shape — aggressive almond */}
              <path
                d="M0 15 Q12 -4 30 0 Q48 4 55 15 Q48 30 30 32 Q12 30 0 15Z"
                fill="hsl(142 71% 45% / 0.15)"
                stroke="#22C55E"
                strokeWidth="1.8"
              />
              {/* Pupil */}
              <ellipse
                cx="28"
                cy="15"
                rx="8"
                ry="10"
                fill="#22C55E"
                style={{
                  filter: "drop-shadow(0 0 8px hsl(142 71% 45% / 0.8))",
                }}
              />
              {/* Inner pupil slit */}
              <ellipse cx="28" cy="15" rx="3" ry="9" fill="hsl(142 71% 30%)" />
              {/* Highlight */}
              <circle cx="23" cy="11" r="2.5" fill="hsl(142 71% 75% / 0.7)" />
            </motion.g>
          </motion.g>
        </g>

        {/* ── Right Eye ── */}
        <g transform="translate(120, 70)">
          <motion.g
            style={{ originX: "50%", originY: "50%" }}
            variants={eyeOpenVariants}
            initial="hidden"
            animate={visible ? "visible" : "hidden"}
          >
            <motion.g
              style={{ originX: "50%", originY: "50%" }}
              variants={blinkVariants}
              initial="hidden"
              animate={visible ? "visible" : "hidden"}
            >
              <path
                d="M0 15 Q7 4 25 0 Q43 -4 55 15 Q43 30 25 32 Q7 30 0 15Z"
                fill="hsl(142 71% 45% / 0.15)"
                stroke="#22C55E"
                strokeWidth="1.8"
              />
              <ellipse
                cx="27"
                cy="15"
                rx="8"
                ry="10"
                fill="#22C55E"
                style={{
                  filter: "drop-shadow(0 0 8px hsl(142 71% 45% / 0.8))",
                }}
              />
              <ellipse cx="27" cy="15" rx="3" ry="9" fill="hsl(142 71% 30%)" />
              <circle cx="22" cy="11" r="2.5" fill="hsl(142 71% 75% / 0.7)" />
            </motion.g>
          </motion.g>
        </g>

        {/* ── Nose ── */}
        <motion.path
          d="M100 120 L110 135 L100 140 L90 135 Z"
          stroke="#22C55E"
          strokeWidth="1.5"
          fill="hsl(142 71% 45% / 0.1)"
          strokeLinejoin="round"
          variants={drawTransition(0.5, 0.6)}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
        />

        {/* ── Snout lines ── */}
        <motion.path
          d="M100 140 L100 155"
          stroke="#22C55E"
          strokeWidth="1.2"
          strokeLinecap="round"
          variants={drawTransition(0.6, 0.4)}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
        />

        {/* ── Left jaw line ── */}
        <motion.path
          d="M45 85 Q35 110 50 140 Q65 160 100 155"
          stroke="#22C55E"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          variants={drawTransition(0.6, 0.8)}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
        />

        {/* ── Right jaw line ── */}
        <motion.path
          d="M175 85 Q185 110 170 140 Q155 160 100 155"
          stroke="#22C55E"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          variants={drawTransition(0.6, 0.8)}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
        />

        {/* ── Left brow ── */}
        <motion.path
          d="M35 68 Q50 52 75 60"
          stroke="#22C55E"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          variants={drawTransition(0.3, 0.5)}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
        />

        {/* ── Right brow ── */}
        <motion.path
          d="M185 68 Q170 52 145 60"
          stroke="#22C55E"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          variants={drawTransition(0.3, 0.5)}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
        />

        {/* ── Left ear ── */}
        <motion.path
          d="M35 68 L15 20 L55 55"
          stroke="#22C55E"
          strokeWidth="1.2"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          variants={drawTransition(0.7, 0.6)}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
        />

        {/* ── Right ear ── */}
        <motion.path
          d="M185 68 L205 20 L165 55"
          stroke="#22C55E"
          strokeWidth="1.2"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          variants={drawTransition(0.7, 0.6)}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
        />
      </svg>
    </motion.div>
  );
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState(0);
  // 0: wolf face, 1: logo reveal, 2: fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => setPhase(2), 3200);
    const t3 = setTimeout(() => onFinish(), 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  const showFace = phase < 1;
  const showLogo = phase >= 1 && phase < 2;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-background"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 2 ? 0 : 1, y: phase === 2 ? -8 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Ambient glow */}
        <motion.div
          className="pointer-events-none absolute"
          style={{
            width: 400, height: 400,
            background: "radial-gradient(circle, hsl(142 71% 45% / 0.06) 0%, transparent 60%)",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.3 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />

        <Particles intense={phase >= 2} />

        {/* Wolf face */}
        <WolfFace visible={showFace} />

        {/* Logo reveal */}
        <motion.div
          className="relative z-20"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: showLogo ? 1 : 0,
            scale: showLogo ? [0.85, 1.02, 1.0] : 0.85,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid hsl(142 71% 45% / 0.3)",
              boxShadow: "0 0 20px hsl(142 71% 45% / 0.15), inset 0 0 20px hsl(142 71% 45% / 0.08)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={showLogo ? { opacity: [0, 0.6, 0], scale: [0.8, 1.4, 1.8] } : {}}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          />
          <img
            src={logo}
            alt="GYM WOLVES"
            className="relative h-40 w-40 object-contain"
            style={{ filter: "drop-shadow(0 0 20px hsl(142 71% 45% / 0.25))" }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="relative z-20 mt-4 text-[36px] font-bold uppercase tracking-tight text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: showLogo ? 1 : 0, y: showLogo ? 0 : 16 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        >
          GYM WOLVES
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="relative z-20 mt-2 text-sm font-medium uppercase tracking-[0.25em] text-primary"
          style={{ textShadow: "0 0 16px hsl(142 71% 45% / 0.3)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: showLogo ? 1 : 0, y: showLogo ? 0 : 8 }}
          transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
        >
          Ative o modo matilha
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
