---
trigger: always_on
---

# 05: Forbidden AI Tells & Final Pre-Flight Checklist

> Strict prohibitions against AI-generated design clichés and the mandatory verification checklist required before declaring any frontend task complete.

---

## 1. Absolute Em-Dash Ban (The #1 AI Tell)

**The em-dash (`—`) is COMPLETELY BANNED.** It is the most frequent stylistic AI crutch and an immediate visual tell in production testing.

* **Zero-tolerance scope:** Forbidden in headlines, eyebrows, pills, badges, button labels, image captions, navigation items, body copy, quotes, attributions, captions, and alt text.
* **En-dash (`–`) is also banned as a separator:** Date ranges (`2018-2026`) and number ranges (`$40-80k`) must use a regular hyphen `-`.
* **Permitted characters only:**
  * Regular hyphen `-` (for compound words, ranges, and markup dividers).
  * Minus sign in mathematical expressions (`-5°C`).
* **Rewriting rules:** Replace with a period, comma, colon, parentheses, or a separate sentence.
* **Failure condition:** If output contains a single `—` or `–` visible to the user, the output fails pre-flight verification and must be rewritten immediately.

---

## 2. Forbidden Patterns (AI Design Tells)

### 2.A Visual & CSS Tells
* **NO neon / outer glows** by default. Use 1px inner borders or soft tinted shadows.
* **NO pure black (`#000000`).** Use off-black (Zinc 950, Slate 950, charcoal).
* **NO oversaturated accents.** Keep saturation under 80% and harmonize with neutrals.
* **NO excessive gradient text** on large headlines.
* **NO custom mouse cursors.** Accessibility-hostile and performance-damaging.

### 2.B Typography Tells
* **NO Inter as default.** Use Geist, Outfit, Satoshi, or Cabinet Grotesk.
* **NO oversized screaming H1s.** Balance hierarchy through font weight and spacing, not scale alone.
* **NO Fraunces or Instrument_Serif as default serifs.**
* **NO mixed-family inline headline emphasis.** Never inject a random serif word into a sans headline. Use italic/bold of the SAME font family.
* **NO `<br>`-broken and italicized headlines** as a cliché design flourish.
* **NO vertical 90-degree rotated text.**

### 2.C Layout & Spacing Tells
* **NO 3-column equal feature cards.** The generic three-equal-cards row is banned. Use asymmetric grids, 2-column zig-zag, or horizontal scroll alternatives.
* **NO decorative hairline grid lines or crosshairs** drawn solely to look "designed."
* **NO floating top-right sub-text** in section headers. Stack headline and body vertically.

### 2.D Content & Data Tells ("Jane Doe" Clichés)
* **NO generic placeholder names:** "John Doe", "Sarah Chan", "Jack Su". Use realistic, contextual names.
* **NO generic avatar placeholders:** Avoid plain SVG user outlines or Lucide user icons. Use photo seeds or styled initials.
* **NO fake-perfect metrics:** Avoid `99.99%`, `50%`, `1234567`. Use realistic data (`47.2%`, `14.8k`).
* **NO startup-slop brand names:** "Acme", "Nexus", "SmartFlow", "Cloudly". Use contextual, credible brand names.
* **NO empty buzzword verbs:** "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionize". Use direct, concrete action verbs.

### 2.E Production-Test Tells (Hard Bans)
* **Hero Version Labels Banned:** Do not add `V0.6`, `v2.0`, `BETA`, or `EARLY ACCESS` tags in the hero.
* **Section Numbering Banned:** `00 / INDEX`, `001 Capabilities`, `06 How it works` are banned. Name topics in clear, plain language.
* **Middle-Dot (`·`) Rationing:** Maximum 1 middle-dot per line in metadata. Never use as generic text separator.
* **ZERO Decorative Status Dots:** Colored indicator dots are banned unless reflecting live, semantic state.
* **NO Div-Based Fake Screenshots:** Never build fake product UIs, fake terminals, or fake task boards from styled `<div>` elements. Use real screenshots, generated images, or real component previews.
* **NO Fake Version Footers:** `v0.6.2-rc.1` or `last sync 4s ago` inside marketing screenshots screams AI.
* **NO Performative Marketing Labels:** Avoid "Quietly trusted by", "Field notes", "On our desks", "Loose plates". Use clear, functional titles ("Testimonials", "Case Studies").
* **NO Weather / Locale Strips:** `LIS 14:23 · 18°C` is banned unless the brief is explicitly about a localized physical venue.
* **NO Pills Overlaid on Images:** Never overlay `Brand · 02` badges on top of photography.
* **NO Decorative Photo Credit Captions:** `Field study no. 12 · Ines Caetano` under stock photos is banned.
* **NO Version Footers on Marketing Sites:** `v1.4.2` or `Build 0048` belong on developer dashboards, not marketing footers.
* **NO Hero Bottom Text Strips:** Cliché mono strips (`BRAND. MOTION. SPATIAL.`) at the base of the hero are banned.
* **NO Filled Progress Bars for Comparisons:** Avoid dashboard-style filled comparison bars on marketing pages.
* **NO Scroll Cues:** `Scroll`, `↓ scroll`, or animated mouse-wheel icons are banned. Users know how to scroll.

---

## 3. Mandatory Final Pre-Flight Check Matrix

Run every check before delivering code. If any box fails, fix it before declaring the task done:

- [ ] **Brief inference declared?** Outputted the one-line Design Read before code generation?
- [ ] **Dial values set?** `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY` explicitly reasoned?
- [ ] **Design system honest?** Official package used if applicable, or aesthetic labeled honestly?
- [ ] **ZERO em-dashes (`—`) anywhere?** Checked headlines, eyebrows, pills, body, quotes, buttons, captions, alt text?
- [ ] **Page Theme Lock honored?** Exactly ONE theme for the entire page (no inverted section flips mid-scroll)?
- [ ] **Color Consistency Lock?** Single accent color used consistently across all sections?
- [ ] **Shape Consistency Lock?** Uniform corner-radius system applied throughout the page?
- [ ] **Button Contrast Check?** Every CTA label satisfies WCAG AA contrast (4.5:1 min) against button background?
- [ ] **CTA Button Wrap Ban?** All primary CTA button labels fit on ONE line at desktop?
- [ ] **Form Contrast Check?** Inputs, placeholders, focus rings, and labels meet WCAG AA standards?
- [ ] **Serif Discipline?** Sans-serif display by default; serif used only if justified; Fraunces/Instrument_Serif avoided?
- [ ] **Italic Descender Clearance?** Words with `y, g, j, p, q` have `leading-[1.1]` min + `pb-1` reserve?
- [ ] **Premium-Consumer Palette Check?** Banned beige+brass+espresso family avoided for luxury/consumer briefs?
- [ ] **Hero Viewport Fit?** Headline <= 2 lines, subtext <= 20 words, CTA visible without scrolling?
- [ ] **Hero Top Padding?** Max `pt-24` on desktop; hero does not float halfway down the page?
- [ ] **Hero Stack Discipline?** Max 4 text elements total (eyebrow, headline, subtext, CTAs)? No taglines below CTAs?
- [ ] **Eyebrow Count Restraint?** Number of eyebrows <= `ceil(sectionCount / 3)`? Hero counts as 1.
- [ ] **Split-Header Ban?** No split headline + floating right body paragraph?
- [ ] **Zigzag Alternation Cap?** Max 2 consecutive left-image/right-text sections?
- [ ] **No Duplicate CTA Intent?** Single standardized label per user intent across the page?
- [ ] **Logo Wall = Logos Only?** Social proof strip placed UNDER hero, uses real SVG marks, no category subtitles?
- [ ] **Bento Background Diversity?** At least 2-3 bento cells contain real images, gradients, or patterns?
- [ ] **Bento Rhythm & Cell Count?** Exactly as many cells as content items (no blank placeholder cells)?
- [ ] **Copy Self-Audit Complete?** Verified zero grammatically broken or AI-hallucinated phrases?
- [ ] **Motion Motivated?** Every animation justified by hierarchy, storytelling, or feedback?
- [ ] **Marquee Limit?** At most one horizontal marquee per page?
- [ ] **Single-Line Navigation?** Navigation fits on one line at desktop (`lg`), height <= 80px?
- [ ] **Section Layout Diversity?** At least 4 distinct layout families across 8 sections?
- [ ] **Long Lists Handled?** Lists > 5 items use structured UI (cards, tabs, scroll-pills) instead of plain bullets?
- [ ] **Real Images Used?** Generated images or descriptive Picsum seeds used; NO div-based fake previews?
- [ ] **No Decorative AI Fluff?** No version labels in hero, no numbered eyebrows, no scroll cues, no decorative dots?
- [ ] **Motion Claimed = Motion Shown?** If `MOTION_INTENSITY > 4`, page genuinely animates?
- [ ] **No Scroll Event Listeners?** NO `window.addEventListener('scroll')` or `window.scrollY` in React state?
- [ ] **Reduced Motion Supported?** All animations above `MOTION_INTENSITY > 3` honor `prefers-reduced-motion`?
- [ ] **Viewport Stability?** Uses `min-h-[100dvh]`, NEVER `h-screen`?
- [ ] **Component Cleanliness?** `useEffect` animations have cleanup; motion isolated in client leaves with `'use client'`?
