---
trigger: model_decision
description: Design engineering directives: typography standards (sans display, strict serif discipline, descender clearance), color calibration and locks, hero constraints, bento grids, and layout discipline.
---

# 02: Design Engineering Directives & Layout

> Rules for typography, color harmony, visual structure, and layout discipline. These rules prevent common LLM design defaults and enforce production-grade aesthetic quality.

---

## 1. Typography Engineering

LLMs default to cliché font choices and uncurated scales. Enforce intentional typographic craft.

### 1.A Scales & Proportions
* **Display / Headlines:** Default `text-4xl md:text-6xl tracking-tighter leading-none`.
* **Body / Paragraphs:** Default `text-base text-gray-600 leading-relaxed max-w-[65ch]`.

### 1.B Sans Font Selection
* **Discouraged as default:** `Inter`. Pick `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, or an intentional brand font.
* **Override:** Inter is acceptable only when the user explicitly requests a neutral/standard Linear-style interface or a public-sector accessibility-first site.
* **Recommended Pairings:**
  * `Geist` + `Geist Mono`
  * `Satoshi` + `JetBrains Mono`
  * `Cabinet Grotesk` + `Inter Tight`
  * `GT America` + `IBM Plex Mono`

### 1.C Strict Serif Discipline (Very Discouraged as Default)
* Serif is **very discouraged as the default font** for any creative, modern, or lifestyle project. Assuming that "creative brief = serif font" is a primary LLM hallmark.
* **Default choice:** Sans-serif display (Geist Display, PP Neue Montreal, Cabinet Grotesk Display, Söhne Breit, Migra Sans, Inter Display).
* **Serif is permitted ONLY when:**
  1. The brief explicitly names a serif font, OR
  2. The aesthetic family is genuinely editorial, luxury, publication, manuscript, or heritage, AND you can articulate why this specific serif fits this brand.
* **Emphasis Rule:** When emphasizing a word in a headline, use the **italic or bold style of the SAME font family**. NEVER inject a random serif word into a sans headline.
* **BANNED as default serifs:** `Fraunces` and `Instrument_Serif`.
* **Approved Serif Pool (rotate when justified, never reuse consecutively):** PP Editorial New, GT Sectra Display, Cardinal Grotesque, Reckless Neue, Tiempos Headline, Recoleta, Cormorant Garamond, Playfair Display, EB Garamond, IvyPresto, Canela, Domaine Display.

### 1.D Mandatory Italic Descender Clearance
When italic is used in display typography and contains letters with descenders (`y`, `g`, `j`, `p`, `q`), tight line heights (`leading-none` or `leading-[1]`) clip the glyph. Always use `leading-[1.1]` minimum and add `pb-1` or `mb-1` reserve padding to the container.

---

## 2. Color Calibration & Palette Locks

### 2.A Accent Discipline & The Lila Rule
* Maximum **1 accent color** per project. Saturation must remain under 80% by default.
* **The Lila Rule:** Neon AI purple/blue button glows and random saturated violet gradients are banned as defaults. Use neutral bases (Zinc, Slate, Stone) with high-contrast singular accents (Emerald, Electric Blue, Deep Rose, Burnt Orange).
* **Override:** If the brand explicitly requests purple, execute with muted, harmonized neutrals rather than generic glowing gradients.

### 2.B Color Consistency Lock
Once an accent color is defined, it must remain consistent across the **entire page**. Never change the accent color between sections (e.g. no warm-grey site suddenly gaining a teal badge in the footer).

### 2.C Premium-Consumer Palette Ban (Mandatory)
For luxury, artisan, cookware, wellness, and DTC consumer briefs, LLMs default to:
* Backgrounds: Warm paper/cream (`#f5f1ea`, `#f7f5f1`, `#efeae0`, `#ece6db`).
* Accents: Brass, clay, oxblood, ochre (`#b08947`, `#b6553a`, `#9a2436`, `#9c6e2a`).
* Text: Espresso near-black (`#1a1714`, `#1b1814`).

**This palette is BANNED as a default reach.** Rotate through these alternative palettes instead:
1. **Cold Luxury:** Silver-grey + chrome + smoke (clean, architectural).
2. **Forest:** Deep forest green + bone neutral + subtle amber accent.
3. **Black and Tan:** True off-black + warm tan, sharp contrast, crisp neutrals.
4. **Cobalt + Cream:** High-saturation blue against an off-white base, no brass.
5. **Terracotta + Slate:** Warm rust set against cool slate-grey.
6. **Monochrome + Pop:** Off-white + charcoal + single electric pop (emerald or cobalt).

*Override:* The beige+brass palette is permitted only when the brand guidelines explicitly name those hex codes.

---

## 3. Materiality, Shadows & Shapes

* **Card Restraint:** Use cards ONLY when elevation communicates meaningful visual hierarchy. Otherwise group content using `border-t`, `divide-y`, or clean whitespace. For `VISUAL_DENSITY > 7`, card containers are banned.
* **Tinted Shadows:** Never use pure-black drop shadows on light backgrounds. Always tint shadows to match the background hue.
* **Shape Consistency Lock:** Select ONE corner-radius scale for the entire page:
  * All-sharp: `rounded-none`
  * All-soft: `rounded-xl` / `rounded-2xl` (12-16px)
  * All-pill: `rounded-full` for interactive items
  * Do not mix sharp cards with pill buttons unless documented in a systemic component scale.

---

## 4. Strict Layout Discipline (Hard Rules)

Failing any rule in this section represents broken frontend output.

### 4.A Hero Section Constraints
* **Initial Viewport Fit:** Hero content must fit within the initial viewport. Headline max 2 lines on desktop; subtext max 20 words AND max 3-4 lines. Primary CTA must be visible without scrolling.
* **Font Scale Planning:** Plan typography and assets together. Default hero range: `text-4xl md:text-5xl lg:text-6xl`. Never jump to `text-8xl` if the headline exceeds 5 words.
* **Top Padding Cap:** Hero top padding must not exceed `pt-24` (≈6rem) on desktop.
* **Hero Stack Discipline (Max 4 text elements total):**
  1. Eyebrow OR brand strip (pick zero or one)
  2. Headline (max 2 lines)
  3. Subtext (max 20 words)
  4. CTAs (1 primary + max 1 secondary)
  * **BANNED in hero:** Taglines below CTAs, micro trust strips, pricing teasers, feature bullets, avatar rows. Move these to dedicated sections below.
* **Logo Wall Placement:** "Used by / Trusted by" logo strips belong UNDER the hero section, never inside it.

### 4.B Navigation Rules
* Navigation items MUST fit on a single line on desktop (`lg: 1024px`).
* Navigation height cap: max 80px on desktop (default 64-72px).

### 4.C Layout Variety & Section Rules
* **Anti-Center Bias:** Avoid centered hero/H1 layouts when `DESIGN_VARIANCE > 4`. Use 50/50 split screen, left-aligned content with right-aligned asset, or asymmetric whitespace.
* **Section-Layout-Repetition Ban:** A layout family (e.g. 3-column cards, full-width quote, split image-text) may appear at most ONCE on a page. An 8-section landing page must use at least 4 distinct layout families.
* **Zigzag Alternation Cap:** Maximum 2 consecutive sections of alternating left-image/right-text. The 3rd consecutive section must break the pattern with a different layout.
* **Eyebrow Restraint (#1 Most Violated Rule):**
  * Maximum **1 eyebrow per 3 sections** (`ceil(sectionCount / 3)`). Hero counts as 1.
  * If Section A has an eyebrow, the next 2 sections CANNOT have an eyebrow.
  * Drop unnecessary eyebrows; let section headings speak for themselves.
* **Split-Header Ban:** Avoid the default pattern of "left large headline + right floating body paragraph". Stack headline and body vertically unless there is an interactive component in the second column.
* **Bento Grid Discipline:**
  * **Cell Count Rule:** A bento grid must contain EXACTLY as many cells as there is content (3 items = 3 cells; 5 items = 5 cells). Zero empty placeholder cells.
  * **Background Diversity:** In any multi-cell grid, at least 2-3 cells must have visual variation (real imagery, gradient tint, or pattern), not all identical white-on-white text boxes.
* **Mobile Collapse Declaration:** Every multi-column layout must explicitly declare its `< 768px` single-column fallback (`grid-cols-1 md:grid-cols-3`).
