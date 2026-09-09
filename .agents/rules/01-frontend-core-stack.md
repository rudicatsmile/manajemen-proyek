---
trigger: model_decision
description: Frontend architecture, tech stack standards (Next.js RSC, React, Tailwind v4, Motion), brief inference, design dials (VARIANCE, MOTION, DENSITY), and design system mapping.
---

# 01: Frontend Core, Stack & Architecture

> Scope: Landing pages, portfolios, and marketing redesigns. Not dashboards, data tables, or multi-step product UI. Every rule is contextual: first read the brief, then pull only what fits.

---

## 0. Brief Inference (Read the Room First)

Before touching code or configuring dials, infer what the user actually needs. Never default to generic aesthetics.

### 0.A Signals to Read First
1. **Page kind**: Landing (SaaS / consumer / agency / event), portfolio (developer / designer / creative studio), redesign (preserve vs overhaul), editorial / blog.
2. **Vibe words**: "minimalist", "calm", "Linear-style", "Awwwards", "brutalist", "premium consumer", "Apple-y", "playful", "serious B2B", "editorial", "dark tech".
3. **Reference signals**: URLs linked, screenshots shared, products named, competitor brands.
4. **Audience**: B2B procurement panel vs design-conscious consumer vs recruiter. The audience chooses the aesthetic.
5. **Brand assets**: Existing logos, colors, typography, photography.
6. **Quiet constraints**: Accessibility-first audiences, public sector, regulated industries, trust-first commerce. These override aesthetic preference.

### 0.B Mandatory One-Line "Design Read"
Before generating any frontend code, output this exact declaration:
`Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system or aesthetic family>.`

### 0.C Ambiguity Handling
If the brief is ambiguous, ask exactly **one** clarifying question (never a multi-question dump). If you can confidently infer from context, **do not ask**; declare the design read and proceed.

### 0.D Anti-Default Discipline
Deliberately reject LLM clichés: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism on everything, infinite micro-animations, Inter + slate-900.

---

## 1. The Three Dials (Core Configuration)

Set three dials after the design read. Use these exact variable names:
* **`DESIGN_VARIANCE: 8`** (1 = Perfect Symmetry, 10 = Artsy Chaos)
* **`MOTION_INTENSITY: 6`** (1 = Static, 10 = Cinematic / Physics)
* **`VISUAL_DENSITY: 4`** (1 = Art Gallery / Airy, 10 = Cockpit / Packed Data)

**Baseline:** `8 / 6 / 4`. Override conversationally based on the design read.

### 1.A Dial Inference & Presets
| Use Case / Signal | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| Minimalist / clean / calm / editorial / Linear-style | 5-6 | 3-4 | 2-3 |
| Premium consumer / Apple-y / luxury | 7-8 | 5-7 | 3-4 |
| Playful / wild / Awwwards / experimental | 9-10 | 8-10 | 3-4 |
| Landing (SaaS, mainstream default) | 7 | 6 | 4 |
| Landing (Agency / creative) | 9 | 8 | 3 |
| Portfolio (Designer / studio) | 8 | 7 | 3 |
| Portfolio (Developer) | 6 | 5 | 4 |
| Editorial / Blog | 6 | 4 | 3 |
| Trust-first / public-sector / regulated | 3-4 | 2-3 | 4-5 |
| Redesign (preserve) | match existing | +1 | match existing |
| Redesign (overhaul) | +2 | +2 | match existing |

### 1.B Dial Technical Definitions
* **`DESIGN_VARIANCE` (1-10):**
  * `1-3 (Predictable)`: Symmetrical grid (12-col equal fr), equal padding, centered alignment.
  * `4-7 (Offset)`: Margin overlaps (`-mt-8`), varied image ratios (4:3 vs 16:9), left headers over centered data.
  * `8-10 (Asymmetric)`: Masonry layouts, asymmetric fractional grids (`2fr 1fr 1fr`), massive empty zones (`pl-[20vw]`).
  * **Mobile Override:** For levels 4-10, asymmetric layouts above `md:` MUST collapse to single-column (`w-full px-4 py-8`) on viewports `< 768px`.
* **`MOTION_INTENSITY` (1-10):**
  * `1-3 (Static)`: No automatic motion. CSS `:hover` and `:active` only. Honors reduced motion by default.
  * `4-7 (Fluid CSS)`: Transitions with `cubic-bezier(0.16, 1, 0.3, 1)`. Cascading load-in delays. Transform and opacity only.
  * `8-10 (Advanced Choreography)`: Complex scroll reveals, parallax, scroll-driven timelines, physics.
* **`VISUAL_DENSITY` (1-10):**
  * `1-3 (Art Gallery)`: Generous white space, huge section gaps (`py-32` to `py-48`).
  * `4-7 (Standard App)`: Balanced web spacing (`py-16` to `py-24`).
  * `8-10 (Cockpit)`: Tight paddings, data separated by 1px rules instead of card boxes. Mandatory `font-mono` for metrics.

---

## 2. Brief to Design System Mapping

Pick the right foundation. Do not reinvent CSS for established design systems.

### 2.A Official Design Systems (Use Official Packages)
| Brief Direction | Official Package | Notes |
|---|---|---|
| Enterprise SaaS / Microsoft | `@fluentui/react-components` | Fluent UI, official tokens, built-in a11y |
| Google / Material product | `@material/web` + M3 tokens | Material Theming |
| IBM / B2B analytics | `@carbon/react` + `@carbon/styles` | Carbon data-density patterns |
| Shopify app surfaces | `polaris.js` / `@shopify/polaris` | Required for Shopify admin UI |
| Atlassian / Jira style | `@atlaskit/*` + `@atlaskit/tokens` | Official Atlassian DS |
| GitHub devtool / dev community | `@primer/css` or `@primer/react-brand` | Primer Brand for marketing |
| UK public sector | `govuk-frontend` | Regulatory expectation |
| US public sector | `uswds` | US Web Design System |
| Fast MVP / local business | Bootstrap 5.3 | Stable, fast |
| Modern accessible React foundation | `@radix-ui/themes` | Primitives + polished themes |
| Owned component SaaS | `shadcn/ui` (`npx shadcn@latest add`) | Own the code; never ship default styling |
| Modern indie SaaS / AI marketing | Tailwind v4 utilities + `dark:` | Default for modern custom web apps |

* **Honesty Rule:** Install and use official packages when the brief calls for one. Do not mix systems (e.g. no Fluent React mixed with Carbon, no shadcn mixed into Material 3). Exactly **one** system per project.

### 2.B Pure Aesthetic Trends (No Official Single Package)
When the brief is an aesthetic direction, implement with native CSS + Tailwind + maintained primitives:
* **Glassmorphism**: `backdrop-filter`, layered borders, highlight overlays. Provide solid fallback for `prefers-reduced-transparency`.
* **Bento Grids**: CSS Grid with mixed cell spans.
* **Brutalism**: Native CSS, monospace, raw borders, high contrast.
* **Editorial**: Serif display, asymmetric grid, generous whitespace.
* **Dark tech / hacker**: Monospace + singular accent neon, terminal motifs.
* **Apple Liquid Glass**: Platform-native to Apple OS. On the web, it is strictly an approximation using `backdrop-filter` + inner refraction borders. Label clearly as approximation in code.

---

## 3. Default Architecture & Conventions

Unless a specific official design system is selected, use these defaults:

### 3.A Tech Stack
* **Framework:** React or Next.js. Default to React Server Components (RSC).
  * **RSC Safety:** Global state belongs ONLY in Client Components. Wrap providers in `"use client"` components.
  * **Interactivity Isolation:** Any component with Motion, scroll listeners, or pointer physics MUST be an isolated leaf component marked with `'use client'`. Server Components render static markup.
* **Styling:** **Tailwind v4** (default).
  * In Tailwind v4: use `@tailwindcss/postcss` or Vite plugin. Never use the legacy v3 `tailwindcss` PostCSS plugin.
* **Animation:** **Motion** (import from `motion/react`: `import { motion } from "motion/react"`).
* **Fonts:** Use `next/font` (Next.js) or self-host with `@font-face` + `font-display: swap`. Never link Google Fonts via HTML `<link>` tags in production.

### 3.B State Discipline
* Local `useState` / `useReducer` for isolated UI.
* Global state (Zustand, Jotai, React Context) ONLY for deep prop-drilling avoidance.
* **HARD BAN:** NEVER use `useState` to track continuous user inputs (mouse position, scroll progress, pointer physics, magnetic hover). Use Motion's `useMotionValue`, `useTransform`, or `useScroll`. State updates on continuous events collapse mobile framerates.

### 3.C Icons
* **Allowed libraries (in order):** `@phosphor-icons/react`, `hugeicons-react`, `@radix-ui/react-icons`, `@tabler/icons-react`.
* **Discouraged:** `lucide-react` (use only if explicitly requested or already installed in project).
* **HARD BAN:** NEVER hand-roll SVG icon paths. If a glyph is missing, install an allowed icon package or compose from primitives.
* **One family per project:** Never mix Phosphor with Lucide. Standardize `strokeWidth` globally (e.g. `1.5` or `2.0`).

### 3.D Emoji Policy
* Emojis are discouraged by default in code, UI markup, and visible text. Replace with icon-library glyphs.
* Allow emojis only when the user explicitly requests a playful or social-native vibe.

### 3.E Responsiveness & Layout Mechanics
* Standardize breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`.
* Layout containment: `max-w-[1400px] mx-auto` or `max-w-7xl mx-auto`.
* **Viewport Stability:** NEVER use `h-screen` for hero sections. ALWAYS use `min-h-[100dvh]` to avoid mobile address bar jumping.
* **Grid over Flex-Math:** NEVER use complex percentage flex math (`w-[calc(33%-1rem)]`). ALWAYS use CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`).

### 3.F Dependency Verification
Before importing any 3rd-party library, verify `package.json`. If missing, output the install command first. Never assume packages exist.

---

## 4. Out of Scope Boundaries

This ruleset is NOT for:
* Dashboards, admin panels, dense data tables (reach for TanStack Table, AG Grid, Carbon, or Fluent).
* Multi-step wizard forms or code editors (Monaco / CodeMirror).
* Native mobile apps (Apple HIG / Material).
* Real-time collaborative canvas applications.

If the task falls into these categories, state so explicitly, select the appropriate tools, and apply these rules only to landing, marketing, and about pages.
