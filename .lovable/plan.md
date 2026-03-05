

## Premium Splash Screen — Wolf Eyes Neon LED Animation

Complete rewrite of `SplashScreen.tsx` with a multi-phase cinematic animation sequence over 3 seconds.

### Architecture

Single file rewrite using **Framer Motion** for all animations + inline SVG for the wolf eye shapes. No external assets needed (remove logo import).

### Visual Elements (SVG)

- **Two vertical neon pupils**: Thin rounded rectangles (`rx` rounded), stroke + fill `#22C55E`, with `filter: drop-shadow` for LED glow
- **Eye outlines**: Four subtle curved paths (upper/lower lid per eye) that animate from closed (flat) to open (curved apart)
- **Energy particles**: 12-16 small circles scattered near center, animated with random offsets using Framer Motion

### Animation Phases (total ~3s)

| Phase | Time | What happens |
|-------|------|-------------|
| 0 | 0–0.2s | Empty gray screen |
| 1 | 0.2–0.6s | Energy particles fade in, float toward center |
| 2 | 0.6–1.0s | Pupils ignite with electrical flash (opacity 0→1, scaleY 0.1→1, glow pulse) |
| 3 | 1.0–1.6s | Eye outlines appear and separate (translateY animation simulating opening) |
| 4 | 1.6–2.1s | Intense stare — pupils brighten (glow intensifies), subtle pulse through outlines |
| 5 | 2.1–2.5s | Slow blink — outlines close back, pupils remain briefly |
| 6 | 2.5–2.7s | LED shutdown — pupils dim (opacity→0) |
| 7 | 2.7–3.0s | Particles dissolve outward, screen fades to clean gray, `onFinish()` called |

### Implementation Approach

- Use a single `phase` state (0-7) driven by `setTimeout` chain in `useEffect`
- Each visual element uses Framer Motion's `animate` prop keyed to `phase`
- Particles: Array of 14 objects with random positions, rendered as `motion.div` circles
- Glow effect: CSS `box-shadow` and `filter: drop-shadow` with animated intensity
- The ignition flash: Quick scale + opacity keyframes on the pupil elements
- Eye outlines: SVG paths with animated `d` attribute or simulated via `translateY` on upper/lower line groups

### File Changed

1. **`src/components/SplashScreen.tsx`** — Full rewrite: remove logo, create particle system + SVG wolf pupils + eye outlines + 8-phase animation sequence. Timer total ~3s before `onFinish()`.

