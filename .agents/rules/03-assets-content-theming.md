---
trigger: model_decision
description: Visual assets strategy, SVG icons and logos, content density, copy self-audit, UI state accessibility (button/form contrast, CTA wrap ban), and theme/dark-mode consistency.
---

# 03: Assets, Content Density & Theming

> Standards for visual assets, copy discipline, interactive UI states, accessibility verification, and dual-mode theme consistency.

---

## 1. Image & Visual Asset Strategy

Landing pages and portfolios are visual products. Text-only pages and fake-screenshot divs are unacceptable slop.

### 1.A Asset Priority Hierarchy
1. **Image-Generation Tool First:** When an image-generation tool (`generate_image`, etc.) is available, generate section-specific assets (hero shots, product visualisations, texture backgrounds) at appropriate aspect ratios.
2. **Real Web Photography Second:** When no generator is available, use real photo sources:
   * Descriptive Picsum seeds: `https://picsum.photos/seed/{descriptive-seed}/{w}/{h}` (e.g. `seed/kitchen-cookware/1200/800`)
   * Real stock or brand asset URLs provided in the brief.
3. **Last Resort (Explicit Slots):** If neither is possible, leave clearly marked placeholder slots (`<!-- TODO: hero product photo, 1600x1200 -->`) and report them explicitly to the user. Never substitute div-based fake previews.

### 1.B Image Guidelines
* **Minimalist sites still require real images:** Minimalist design is not plain text. Even an editorial Linear-style page needs 2-3 intentional images (B&W or desaturated if needed).
* **Div-Based Fake Screenshots BANNED:** Never construct fake product UI, fake task lists, or fake terminal windows out of styled `<div>` rectangles. Use real screenshots, generated images, real interactive component previews, or editorial photography.
* **No Hand-Rolled Decorative SVGs:** Icons must come from allowed libraries (Phosphor, Radix, Tabler). Do not hand-roll raw SVG illustrations or decorative graphics.

### 1.C Real SVG Social Proof Logos
* For "Trusted by / Customers" logo bars, use real SVG marks:
  * **Simple Icons:** `https://cdn.simpleicons.org/{slug}/ffffff` (or single-color theme variable).
  * **Devicon:** For technical developer tooling brands.
* **Invented Brands:** Generate a clean SVG monogram (letter in circle or geometric mark) rather than unstyled text wordmarks.
* **LOGO-ONLY Rule (Mandatory):** A logo wall displays logos only. Do not print category labels below logos (no `Vercel` + `hosting`, no `Stripe` + `payments`).

---

## 2. Content Density & Copy Discipline

Landing pages rely on crisp first impressions. Cut unnecessary copy ruthlessly.

### 2.A Section Shape & Density
* **Default Section Formula:** Short headline (<= 8 words) + short subtext (<= 25 words) + ONE visual asset OR ONE primary CTA.
* **No Data-Dump Sections:** Never paste 20-row tables or 30-item lists on a marketing surface. Use top 3-5 highlights with a "View all" link, or convert to a carousel/marquee.
* **Long Lists (> 5 items):** Replace simple `<ul>` bullet lists with structured UI:
  * 2-column split with grouped sections
  * Card grid with image and badge
  * Tabs or accordion for categorized items
  * Horizontal scroll-snap pills
* **Spec Sheet Discipline:** Avoid 10-row specification tables with hairline borders under every row. Use a 2-column card grid (display number + label + short note), grouped cluster cards, or a featured-vs-rest disclosure toggle.

### 2.B Copy Self-Audit (Mandatory Before Shipping)
Before completing any task, audit every visible UI string. Detect and rewrite:
* **Grammatically broken phrases** (e.g. "free on its past", "honest table").
* **Unclear referents** (e.g. "we plan to stay that way" without antecedent).
* **AI hallucination metaphors** (cute-but-meaningless wordplay, performative poetic phrasing).
* **Fake-craftsman labels** (passive-aggressive humility, mock-thoughtful micro-copy).
* If a phrase sounds unnatural, replace it with a direct, functional sentence.

### 2.C Numeric Discipline & Voice
* **Fake-Precise Numbers Flagged:** Numbers like `92%`, `4.1x`, or `13.4 lb` must come from real brief data or be labeled as mock (`<!-- mock -->`). Never invent fake engineering precision.
* **Single Copy Register:** Maintain a consistent voice across the entire page (do not mix raw terminal mono syntax with lyrical consumer marketing).

### 2.D Quotes & Testimonials
* Maximum 3 lines of quote body. Must be readable at a glance.
* Attribution must include name + role + company (never name only).
* Use typographic quotes (`“` and `”`) or clean cards without quotes. Never ASCII straight quotes (`"`).
* Em-dashes in quotes or attribution are strictly forbidden (use hyphen ` - `).

---

## 3. Interactive UI States & Accessibility

LLMs frequently implement only static happy paths. Full interactive lifecycles are required.

### 3.A UI States
* **Loading:** Skeleton loaders mirroring the actual layout structure. Avoid circular spinners.
* **Empty States:** Well-composed layouts indicating how to populate data.
* **Error States:** Contextual and inline messages for forms; transient toasts for systemic errors.
* **Tactile Push Feedback:** Use `:active` with `-translate-y-[1px]` or `scale-[0.98]` on interactive elements.

### 3.B Accessibility & Contrast Checks
* **Button Contrast Check (Mandatory):** CTA button text must pass WCAG AA contrast (4.5:1 minimum) against its button background. White text on white buttons or borderless transparent buttons on light backgrounds are banned.
* **CTA Button Wrap Ban (Mandatory):** Primary CTA button labels MUST fit on a single line on desktop. Shorten the label (1-3 words) or widen the button container. Wrapped CTAs at desktop are an instant failure.
* **No Duplicate CTA Intent:** Do not mix multiple labels for the same action on one page (e.g. do not use "Get in touch" in nav, "Contact us" in hero, and "Let's talk" in footer; pick ONE label and standardize it).
* **Form Contrast Check:** All inputs, placeholders, focus borders, helper text, and error states must satisfy WCAG AA contrast against the section background.
* **Form Field Layout:** Labels sit ABOVE inputs. Helper text sits directly below label or input. Errors appear BELOW inputs. Standard `gap-2`. Never use placeholder text as a substitute for labels.

---

## 4. Page Theme Lock & Dark Mode Protocol

### 4.A Page Theme Lock
A page must maintain ONE coherent color mode. Sections must NEVER invert mid-page (e.g. no light paper section sandwiched in the middle of a dark-mode website). Variations in surface depth (`bg-zinc-950` vs `bg-zinc-900`) are encouraged; mode inversions are banned.

### 4.B Dual-Mode Token Architecture
* Support both light and dark modes from the outset.
* Choose ONE strategy per project:
  * **Tailwind `dark:` variant:** Explicit dark utilities (`bg-white dark:bg-zinc-950`, `text-zinc-900 dark:text-zinc-100`).
  * **Semantic CSS Variables:** Unified tokens (`--surface`, `--text-primary`, `--accent`) adjusted under `[data-theme="dark"]` or `@media (prefers-color-scheme: dark)`.
* Respect `prefers-color-scheme` by default.

### 4.C Contrast & Color Purity
* Maintain WCAG AA contrast across both modes (target AAA for hero headlines).
* **No pure `#000000` or `#ffffff`:** Use off-black (Zinc 950, charcoal) and off-white. Pure black and white eliminate depth and cause visual fatigue.
* Ensure button accents and focus rings remain legible and high-contrast in both modes.
* Verify both modes during development before declaring completion.
