---
trigger: model_decision
description: Motion engineering (Motion and GSAP patterns, scroll-handling bans, reduced motion), web performance guardrails, reference interaction vocabulary, and website redesign protocols.
---

# 04: Motion, Performance & Redesign Protocol

> Rules for physics-based animations, hardware-accelerated motion, web performance guardrails, and structured website redesign workflows.

---

## 1. Motion Engineering & Context

Motion must serve a clear purpose. It must never be decorative clutter.

### 1.A Core Principles
* **Motion Must Be Motivated:** Every animation must communicate hierarchy, storytelling narrative, feedback, or state transition. If an animation cannot be justified in one sentence, remove it.
* **Motion Claimed = Motion Shown:** If `MOTION_INTENSITY > 4`, the page must actually animate (entry reveals, scroll interactions, hover physics). If you cannot deliver reliable motion in the scope, reduce the dial to 3 and ship clean static styling.
* **Physics & Easing:** Default to spring physics (`type: "spring", stiffness: 100, damping: 20`). Avoid linear easing.
* **Marquee Restraint:** Maximum **one** horizontal marquee per page.
* **Apple Liquid Glass Web Approximation:** Apple Liquid Glass is platform-native to Apple OS. On the web, implement it strictly as an approximation using `backdrop-filter`, 1px inner border (`border-white/10`), and inner highlight shadow (`shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`). Always provide a solid fallback for `prefers-reduced-transparency`.
* **Magnetic Micro-Physics:** Implement magnetic buttons exclusively using Motion's `useMotionValue` and `useTransform` outside React's render loop. Never use `useState`.

---

## 2. Canonical Skeletons & Forbidden Animation Patterns

### 2.A GSAP Sticky-Stack Pattern
When implementing a stacked-card scroll effect:
* Pin cards at viewport top (`start: "top top"`).
* Pin every card except the final card.
* Drive card scaling and opacity from the NEXT card's scroll position.
* Wrap in GSAP context (`gsap.context()`) and call `ctx.revert()` in the cleanup function.

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div key={i} className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center">
          {card}
        </div>
      ))}
    </div>
  );
}
```

### 2.B GSAP Horizontal-Pan Pattern
For horizontal scroll sections:
* Start pinning when section top hits viewport top (`start: "top top"`).
* Calculate distance: `track.scrollWidth - window.innerWidth`.
* Set scroll duration: `end: () => "+=" + distance`.
* Use `scrub: 1` and clean up with `ctx.revert()`.

### 2.C Motion Stagger Reveal (Preferred for Simple Reveals)
For items entering the viewport without scroll pinning, use Motion's `whileInView`:
```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function RevealList({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```

### 2.D Forbidden Animation Patterns (Hard Bans)
* **HARD BAN:** `window.addEventListener("scroll", ...)`. It runs unthrottled on every frame and creates layout jank. Use Motion's `useScroll()`, GSAP `ScrollTrigger`, `IntersectionObserver`, or CSS scroll-driven animations.
* **HARD BAN:** Storing `window.scrollY` in React state.
* **HARD BAN:** Running `requestAnimationFrame` loops that trigger React state updates.
* **Hardware Acceleration:** Animate ONLY `transform` and `opacity`. Never animate `top`, `left`, `width`, or `height`.
* **Engine Isolation:** NEVER mix GSAP or Three.js with Motion in the same component tree.

---

## 3. Performance & Accessibility Guardrails

* **Mandatory Reduced Motion:** Any motion above `MOTION_INTENSITY > 3` MUST honor `prefers-reduced-motion`. In Motion, wrap components with `useReducedMotion()` and degrade to static. Infinite loops, parallax, and scroll-hijacks must collapse to static under reduced motion.
* **Core Web Vitals Targets:**
  * **LCP < 2.5s:** Preload or assign `priority` to hero images.
  * **INP < 200ms:** Offload heavy computations from the main thread.
  * **CLS < 0.1:** Explicitly reserve aspect-ratio space for media and embeds.
* **DOM Rendering Cost:** Apply grain, blur, or noise filters EXCLUSIVELY to `fixed inset-0 pointer-events-none` pseudo-elements. Never place filter effects on scrolling containers.
* **Z-Index System:** Use a documented z-index scale (e.g. nav `z-40`, modals `z-50`, grain `z-[60]`). Avoid arbitrary random `z-index` declarations.

---

## 4. Reference Interaction Vocabulary

Familiar patterns to select when the brief calls for them:
* **Hero Paradigms:** Asymmetric Split, Editorial Manifesto, Video Mask, Kinetic-Type, Curtain-Reveal, Scroll-Pinned.
* **Navigation:** Dock Magnification, Magnetic Button, Dynamic Island, Mega Menu Reveal.
* **Layout & Grids:** Bento Grid, Masonry, Chroma Grid, Sticky-Stack.
* **Cards & Containers:** Parallax Tilt Card, Spotlight Border Card, Glassmorphism Panel, Morphing Modal.
* **Scroll Animations:** Sticky Scroll Stack, Horizontal Scroll Hijack, Zoom Parallax.

---

## 5. Website Redesign Protocol

Distinguish between greenfield projects and redesigns immediately.

### 5.A Mode Detection
* **Greenfield:** Brand new build with no legacy constraints.
* **Redesign - Preserve:** Modernize visuals while preserving existing brand equity, SEO rankings, and information architecture.
* **Redesign - Overhaul:** Completely fresh visual language while preserving content, routes, and conversions.

### 5.B Audit Before Touching Code
Before writing redesign code, document:
1. **Brand tokens:** Primary colors, fonts, logo usage, corner radii.
2. **Information Architecture (IA):** Page hierarchy, routes, conversion paths.
3. **Patterns to preserve vs retire:** Identify high-performing components vs AI-slop tells.
4. **SEO baseline:** Existing ranking URLs, titles, meta tags.

### 5.C Preservation Rules & Levers
* **Preserve IA & URLs:** Never alter URL slugs or primary navigation labels without explicit instruction.
* **Preserve Brand Accents:** If an existing brand uses purple, respect it and apply the Lila Rule override.
* **Preserve Copy Voice:** Do not rewrite copy when asked for a visual redesign.
* **Modernization Levers (in priority order):**
  1. Typography refresh
  2. Spacing & layout rhythm
  3. Color recalibration
  4. Motion layer
  5. Hero & key-section recomposition
  6. Full block replacement (last resort)
* **What Never Changes Silently:** Route slugs, nav labels, form field names (breaks analytics), brand logos, and legal/cookie copy.
