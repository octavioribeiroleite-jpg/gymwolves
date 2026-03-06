import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const TEXTS = [
  "Analisando treino...",
  "Calculando calorias...",
  "Processando dados...",
  "Quase lá...",
];

const AILoadingAnimation = () => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((i) => (i + 1) % TEXTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Pulsing radar ring */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute h-24 w-24 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute h-24 w-24 rounded-full border-2 border-primary/20"
          animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
        />
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-3xl">🤖</span>
        </motion.div>
      </div>

      {/* Rotating text */}
      <div className="h-6 relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={textIndex}
            className="text-sm font-medium text-muted-foreground text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {TEXTS[textIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "40%" }}
        />
      </div>
    </div>
  );
};

export default AILoadingAnimation;
