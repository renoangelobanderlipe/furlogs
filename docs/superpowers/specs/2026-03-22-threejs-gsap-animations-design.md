# Three.js + GSAP Animation System — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Add a full animation layer to FurLog using GSAP (free tier) for micro-interactions and scroll reveals, and @react-three/fiber + @react-three/drei for 3D scenes. The goal is to bring life and delight to the app without compromising performance, accessibility, or the existing design system.

---

## Constraints

- **GSAP:** Free tier only — `gsap`, `@gsap/react`, `ScrollTrigger` plugin
- **Three.js:** `@react-three/fiber` + `@react-three/drei` (R3F) — no raw three.js
- **SSR:** All Three.js components wrapped in `next/dynamic({ ssr: false })` — zero server bundle cost
- **Accessibility:** All animations gate on `prefers-reduced-motion` — Three.js scenes render static, GSAP tweens are skipped entirely
- **React Compiler:** GSAP uses refs + `useLayoutEffect`, compatible with React 19 Compiler
- **Package manager:** Bun

---

## Architecture

### New files

```
apps/web/
├── hooks/
│   ├── useReducedMotion.ts          # reads prefers-reduced-motion media query
│   └── useGSAP.ts                   # wraps gsap context, gates on reduced motion
├── lib/animations/
│   ├── presets.ts                   # reusable GSAP timeline factories: counter, stagger, slideOut, modalIn, swing, pulse
│   └── easings.ts                   # shared ease strings (e.g. "back.out(1.4)", "power2.out")
└── components/three/
    ├── AuthParticles.tsx            # auth page floating paw particles
    ├── PetCardTilt.tsx              # CSS-perspective + GSAP pointer tilt for pet cards
    ├── PetHeroScene.tsx             # pet detail 3D avatar scene
    ├── SpendingChart3D.tsx          # 3D bar chart replacing Recharts on spending page
    ├── MilestoneConfetti.tsx        # confetti burst on medication streak milestones
    └── DashboardBackground.tsx      # ambient dot grid behind dashboard header
```

### Key principles

- `useReducedMotion` is the single gate — imported by every animation hook, never duplicated inline
- UI components call semantic hooks (`useCounter`, `useStaggerReveal`, `useSlideOut`) — no GSAP boilerplate in UI files
- Three.js scenes are always isolated in `components/three/` and dynamically imported at the call site

---

## Phase 1 — GSAP Core (micro-interactions & counters)

### Stat card counters
- Hook: `useCounter(value: number, duration?: number)`
- Tweens displayed number from 0 → n on mount, 1.2s `power2.out`
- Applied to: all `StatCard` instances on dashboard, pet detail, spending, stock, vet visits pages

### Chart mount animations
- `PetWeightChart` and spending monthly chart: bars animate from 0 height on mount
- Implemented via GSAP targeting Recharts bar elements after render

### List item delete
- `useSlideOut` hook returns a `ref` + `triggerRemove(onComplete)` callback
- Animation: `x: -20, opacity: 0` then height collapse to 0, then `onComplete` fires to remove from state
- Applied to: vet visit rows, medication rows, reminder rows

### Modal/Dialog entrances
- Augment existing Radix Dialog with GSAP on `onOpenAutoFocus`
- `modalIn` preset: backdrop fade in 200ms + content scale `0.95→1` with `back.out(1.4)` over 280ms

### Notification bell swing
- `useSwing` hook triggered when unread count increases
- Rotation keyframes: `0° → 15° → -12° → 8° → -5° → 0°` over 600ms

### Urgency chip pulse
- `usePulse` loop on `high` urgency reminder chips
- Subtle `scale: 1 → 1.04 → 1` every 2s, `power1.inOut`

### Medication dose button
- On dose logged: button background transitions to success color, icon swaps to checkmark, scale bounce
- 300ms spring via `elastic.out(1, 0.4)`

---

## Phase 2 — GSAP ScrollTrigger (scroll reveals)

### Dashboard section reveals
- Each panel (reminders, stock, recent visits, calendar, quick actions) gets `useScrollReveal`
- Trigger: when panel top enters viewport bottom — `start: "top 90%"`
- Animation: `y: 20, opacity: 0 → y: 0, opacity: 1`, staggered 100ms between panels

### List page timeline reveals
- Vet visits, vaccinations, medications list items
- Items slide in from left (`x: -16`) staggered 80ms on scroll enter
- ScrollTrigger `once: true` — animates only on first entry

### Spending insight cards
- 3 insight cards fan in from bottom with stagger on scroll enter

### Purchase history feed
- Feed items reveal sequentially as user scrolls down the list

---

## Phase 3 — Three.js scenes

### AuthParticles (`components/three/AuthParticles.tsx`)
- Full-bleed canvas behind login/register/forgot-password forms
- ~80 floating paw-print sprites (PNG texture on `<Plane>` geometry)
- Particles drift slowly upward, wrapping vertically
- Mouse parallax: scene shifts subtly on pointer move (`useFrame` + lerp)
- Primary color tinted (`hsl(174 80% 40%)` = teal default, respects `data-preset`)
- Skipped entirely when `prefers-reduced-motion` is set

### PetCardTilt (`components/three/PetCardTilt.tsx`)
- **Not full WebGL per card** — CSS `perspective(800px)` + GSAP pointer tracking
- `onMouseMove`: GSAP tweens `rotateX` / `rotateY` toward cursor offset (max ±8deg), 0.3s ease
- `onMouseLeave`: GSAP tweens back to 0,0
- Wrapper component applied around each `PetCard` in the pets grid

### PetHeroScene (`components/three/PetHeroScene.tsx`)
- R3F canvas in the pet detail hero card
- Species emoji or avatar rendered on a `<Plane>` with soft ambient + point light
- Gentle idle rotation (Y axis, very slow)
- Bloom post-processing via `@react-three/postprocessing`
- Falls back to static avatar when no WebGL support

---

## Phase 4 — Three.js advanced

### SpendingChart3D (`components/three/SpendingChart3D.tsx`)
- Replaces Recharts `BarChart` on the spending page
- R3F scene: `BoxGeometry` bars per month, colored by series (vet = primary, food = success)
- Bars animate upward from y=0 on mount via GSAP targeting mesh scale
- Hover: point light intensifies on hovered bar, tooltip via HTML overlay (`<Html>` from Drei)
- Orbit disabled — fixed camera angle, clean dashboard aesthetic

### MilestoneConfetti (`components/three/MilestoneConfetti.tsx`)
- Triggered by prop `trigger: boolean` — set true on 7/30/60 day medication streak
- ~120 instanced small box meshes burst from center, arc outward, fall with gravity
- Paw-print texture on each piece
- Auto-disposes after 3 seconds
- Zero cost when not triggered

### DashboardBackground (`components/three/DashboardBackground.tsx`)
- Subtle ambient dot grid behind the dashboard greeting header
- ~200 instanced small spheres, primary color, gentle float
- Very low opacity — decorative only, never distracts from content
- Paused when tab is not visible (`useVisibilityChange`)

---

## Reduced Motion Behavior

| Animation type | Reduced motion behavior |
|---|---|
| GSAP counters | Value shown immediately at final value |
| GSAP ScrollTrigger reveals | Elements shown immediately, no transition |
| GSAP micro-interactions | All skipped — components render normally |
| Three.js particle scenes | Canvas not rendered at all |
| Three.js 3D charts | Falls back to Recharts flat chart |
| Three.js tilt | No tilt applied |

---

## Package additions

```bash
bun add gsap @gsap/react
bun add @react-three/fiber @react-three/drei @react-three/postprocessing three
bun add -d @types/three
```
