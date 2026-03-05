import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const NEON = "#22C55E";
const BG = "#F3F4F6";

function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4,
    dist: 60 + Math.random() * 80,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 0.3,
  }));
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<Phase>(0);
  const particles = useMemo(() => generateParticles(14), []);

  useEffect(() => {
    const schedule: [number, Phase][] = [
      [200, 1],
      [600, 2],
      [1000, 3],
      [1600, 4],
      [2100, 5],
      [2500, 6],
      [2700, 7],
    ];
    const timers = schedule.map(([ms, p]) => setTimeout(() => setPhase(p), ms));
    const finish = setTimeout(() => onFinish(), 3000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [onFinish]);

  const glowIntensity = phase === 4 ? 1.4 : phase >= 2 && phase <= 5 ? 1 : 0;
  const pupilFilter = `drop-shadow(0 0 ${8 * glowIntensity}px ${NEON}) drop-shadow(0 0 ${20 * glowIntensity}px rgba(34,197,94,0.5))`;

  // Eye lid vertical offset: 0 = closed, 1 = open
  const lidOpen = phase === 3 || phase === 4 ? 1 : 0;

  return (
    <AnimatePresence>
      {phase < 7 && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ backgroundColor: BG }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Energy particles */}
          {particles.map((p) => {
            const inward = phase >= 1 && phase <= 2;
            const dissolve = phase >= 6;
            const visible = phase >= 1 && phase <= 6;
            const cx = Math.cos(p.angle) * (inward ? 20 : p.dist);
            const cy = Math.sin(p.angle) * (inward ? 20 : p.dist);
            const dcx = Math.cos(p.angle) * (dissolve ? p.dist * 2 : 0);
            const dcy = Math.sin(p.angle) * (dissolve ? p.dist * 2 : 0);

            return (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: NEON,
                  boxShadow: `0 0 6px ${NEON}`,
                }}
                animate={{
                  x: dissolve ? dcx : cx,
                  y: dissolve ? dcy : cy,
                  opacity: visible ? (dissolve ? 0 : [0.3, 0.8, 0.3]) : 0,
                  scale: dissolve ? 0.2 : 1,
                }}
                transition={{
                  duration: dissolve ? 0.4 : 0.5,
                  delay: dissolve ? 0 : p.delay,
                  ease: "easeInOut",
                  opacity: {
                    duration: dissolve ? 0.3 : 1.2,
                    repeat: dissolve ? 0 : Infinity,
                    ease: "easeInOut",
                  },
                }}
              />
            );
          })}

          {/* Wolf eyes SVG */}
          <svg
            width="200"
            height="80"
            viewBox="0 0 200 80"
            fill="none"
            className="relative z-10"
            style={{ filter: pupilFilter }}
          >
            {/* Left eye */}
            <g>
              {/* Upper lid */}
              <motion.path
                d="M10 40 Q50 40 90 40"
                stroke={NEON}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                animate={{
                  d: lidOpen
                    ? "M10 40 Q50 18 90 40"
                    : "M10 40 Q50 40 90 40",
                  opacity: phase >= 3 ? 0.8 : 0,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              {/* Lower lid */}
              <motion.path
                d="M10 40 Q50 40 90 40"
                stroke={NEON}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                animate={{
                  d: lidOpen
                    ? "M10 40 Q50 62 90 40"
                    : "M10 40 Q50 40 90 40",
                  opacity: phase >= 3 ? 0.8 : 0,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              {/* Left pupil */}
              <motion.rect
                x="46"
                y="30"
                width="8"
                height="20"
                rx="4"
                fill={NEON}
                animate={{
                  opacity: phase >= 2 && phase <= 6 ? 1 : 0,
                  scaleY: phase === 2 ? [0.1, 1.2, 1] : phase >= 5 ? 0.1 : 1,
                  fillOpacity: phase === 4 ? [0.8, 1, 0.8] : 1,
                }}
                style={{ transformOrigin: "50px 40px" }}
                transition={{
                  duration: phase === 2 ? 0.3 : 0.4,
                  ease: "easeOut",
                  fillOpacity: {
                    duration: 0.5,
                    repeat: phase === 4 ? Infinity : 0,
                    ease: "easeInOut",
                  },
                }}
              />
            </g>

            {/* Right eye */}
            <g>
              {/* Upper lid */}
              <motion.path
                d="M110 40 Q150 40 190 40"
                stroke={NEON}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                animate={{
                  d: lidOpen
                    ? "M110 40 Q150 18 190 40"
                    : "M110 40 Q150 40 190 40",
                  opacity: phase >= 3 ? 0.8 : 0,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              {/* Lower lid */}
              <motion.path
                d="M110 40 Q150 40 190 40"
                stroke={NEON}
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                animate={{
                  d: lidOpen
                    ? "M110 40 Q150 62 190 40"
                    : "M110 40 Q150 40 190 40",
                  opacity: phase >= 3 ? 0.8 : 0,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              {/* Right pupil */}
              <motion.rect
                x="146"
                y="30"
                width="8"
                height="20"
                rx="4"
                fill={NEON}
                animate={{
                  opacity: phase >= 2 && phase <= 6 ? 1 : 0,
                  scaleY: phase === 2 ? [0.1, 1.2, 1] : phase >= 5 ? 0.1 : 1,
                  fillOpacity: phase === 4 ? [0.8, 1, 0.8] : 1,
                }}
                style={{ transformOrigin: "150px 40px" }}
                transition={{
                  duration: phase === 2 ? 0.3 : 0.4,
                  ease: "easeOut",
                  fillOpacity: {
                    duration: 0.5,
                    repeat: phase === 4 ? Infinity : 0,
                    ease: "easeInOut",
                  },
                }}
              />
            </g>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
