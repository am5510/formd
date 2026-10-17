---
name: GovPulse Analytics
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#444651'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#00312c'
  on-tertiary: '#ffffff'
  tertiary-container: '#004942'
  on-tertiary-container: '#4ebdb0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  display:
    fontFamily: Be Vietnam Pro
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is crafted for institutional integrity, clarity, and modern civic engagement across public agencies and enterprise training divisions. It establishes a "Modern Institutional" aesthetic—eschewing archaic, bureaucratic clutter in favor of crisp administrative precision, accessible data hierarchy, and swift questionnaire workflows.

### Target Audience & Psychological Posture
- **Civil Servants & Corporate Evaluators:** Need immediate trust, strict data legibility, and high-density summary views that translate directly into official reporting decks.
- **Participants & Trainees:** Range from junior apprentices to senior directors completing evaluations on desktop or mobile; the interface evokes respect, safety, clarity, and frictionless completion within 3–5 minutes.

### Aesthetic Foundation
- **Modern Corporate / Contemporary Civic:** Clean surfaces, structured white space, subtle hairline dividers, and functional density.
- **Clarity over Ornamentation:** Visual decoration is stripped down; state indicators, categorical labels, and score steps (1–5 Likert scales) rely on explicit typography and deliberate semantic color rather than decorative gradients or heavy drop shadows.

## Colors

The palette mirrors institutional authority, analytical reliability, and positive civic progress:

- **Primary (`#1E3A8A` - Deep Civic Navy):** The anchor for brand headers, primary command buttons, and core structural navigation. It denotes authority, institutional trust, and stability.
- **Secondary (`#2563EB` - Royal Administrative Blue):** Drives active interactions, links, tab highlights, selected radio tiers, and chart distribution bars.
- **Tertiary (`#0D9488` - Emerald Metric Teal):** Serves as the success benchmark, positive NPS (Net Promoter Score) metrics, satisfaction ratings ≥ 4.0, and positive progression curves. Supported by `#10B981` in positive delta tags.
- **Neutral Palette (`#475569` - Slate Slate):** Provides high-contrast, WCAG AAA-compliant body text (`#0F172A` on `#FFFFFF`), subtle borders (`#E2E8F0`), and tinted metric canvas backgrounds (`#F8FAFC`).

### Semantic Evaluation Gradients (1–5 Likert Scale Tokens)
- **Level 1 (Very Dissatisfied):** Crimson Rust (`#DC2626`)
- **Level 2 (Dissatisfied):** Amber Coral (`#EA580C`)
- **Level 3 (Neutral):** Ochre Gold (`#D97706`)
- **Level 4 (Satisfied):** Leaf Green (`#16A34A`)
- **Level 5 (Very Satisfied):** Emerald Forest (`#0D9488`)

## Typography

The design system employs **Be Vietnam Pro** for global UI delivery. Its open counterforms, humanist geometry, and clean terminal cuts pair seamlessly with contemporary Thai geometric sans typefaces (such as Prompt and Sarabun). It avoids formal archaic glyphs in favor of crisp administrative legibility.

### Rules for Implementation
- **Data Tables and Analytical Cards:** Always use tabular numerals (`tnum`) for score indices, standard deviation calculations, and participant counts to ensure clean columnar alignment.
- **Question Statements (Evaluations):** Use `title-md` with `fontWeight: 600` for clear visual scanning across 20+ survey items.
- **Thai & English Pairing:** Keep line-height generous (`1.5` to `1.65` multiplier on body text) to accommodate upper and lower Thai tone marks without vertical clipping.

## Layout & Spacing

A structured 12-column grid anchors desktop views, while survey submission flows switch to a focused single-column content rail.

### Breakpoints & Containers
- **Desktop (≥ 1280px):** 12 columns, `gutter: 1.5rem` (24px), max width `1440px`. Dashboard KPI cards span 3 columns each (4-column grid); the primary evaluation matrix spans 8 columns alongside a 4-column summary metadata sidebar.
- **Tablet (768px – 1279px):** 8 columns, `gutter: 1rem` (16px). Analytics KPIs wrap to 2x2. Evaluation tables convert to stacked cards if horizontal scroll exceeds viewport.
- **Mobile (< 768px):** 4 columns, `margin-mobile: 1rem` (16px). Form layouts collapse into a single vertical stream. The 1–5 scoring scale morphs from horizontal rows to full-width segmented tap blocks.

### Spacing Cadence
- Use `space-xs` (4px) and `space-sm` (8px) for internal input field spacing, tag padding, and Likert score item separation.
- Use `space-md` (16px) for item gaps within grouped lists and fieldset sections.
- Use `space-lg` (24px) for card interior padding and module spacing.
- Use `space-xl` (40px) for demarcating distinct thematic blocks (e.g., Section 1: Curriculum vs. Section 2: Speaker Quality).

## Elevation & Depth

This system utilizes **Tonal Layering with Low-Contrast Borders** rather than dramatic drop shadows, creating an orderly corporate canvas suitable for official reporting and daytime desktop review.

### Surface Architecture
- **Layer 0 (Canvas Base):** `#F8FAFC` (Slate 50). All views, sidebars, and structural backgrounds rest on this cool, glare-free neutral surface.
- **Layer 1 (Card & Container Surface):** `#FFFFFF` (Pure White). Form question containers, metric metric tiles, and data table rows sit on Layer 1, framed by a crisp border: `1px solid #E2E8F0`.
- **Layer 2 (Elevated Overlays & Sticky Bars):** Dropdowns, fixed submission toolbars, and filter popovers employ a crisp edge (`1px solid #CBD5E1`) paired with an ambient shadow:
  `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Layer 3 (Modal Dialogues & Drawer Overlays):** Used for deep drill-down analytics and CSV export configurations:
  `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The design system maintains a **Soft (`1`)** corner language. This provides an organized, architectural boundary that feels modern and approachable without lapsing into playful or informal silhouettes.

- **Base Corner Radius (`0.25rem` / 4px):** Applied to badges, table headers, form inputs, score buttons, and status indicators.
- **Medium / Container Radius (`rounded-lg: 0.5rem` / 8px):** Applied to metric overview cards, questionnaire sections, modal dialogs, and primary dashboard containers.
- **Large Radius (`rounded-xl: 0.75rem` / 12px):** Reserved for floating snackbars, top-level executive summary banner modules, and mobile pull-up bottom sheets.

## Components

### 1. Likert Rating Scale (1–5 Score Component)
- **Desktop Layout:** Horizontal segmented strip of 5 equal-width button cells (`height: 44px`).
- **States:**
  - *Default:* White background, `1px solid #E2E8F0`, slate text (`#475569`).
  - *Hover:* Background `#F1F5F9`, border `#CBD5E1`.
  - *Selected:* Filled background matching the institutional blue (`#1E3A8A`) or level-based semantic color, crisp white bold score number (`#FFFFFF`), with a bottom indicator bar (`2px solid #2563EB`).
- **Mobile Reflow:** Becomes a continuous horizontal segmented bar or uniform touch-friendly chips (`min-height: 48px`).

### 2. Buttons
- **Primary:** Deep Navy (`#1E3A8A`) background, white text (`#FFFFFF`), border radius `4px`, padding `10px 20px`. Hover: `#1E40AF`. Focus: 3px outer ring in `#93C5FD`.
- **Secondary / Export:** White background, `1px solid #CBD5E1`, text `#1E3A8A`. Hover: `#F8FAFC`. Used for "Download PDF/Excel Report" or "Save Draft".
- **Tertiary / Destructive:** Muted text with hover underline or faint red tint (`#FEE2E2` text `#DC2626`).

### 3. Metric KPI Cards (Dashboard)
- **Container:** Pure white, `border: 1px solid #E2E8F0`, padding `20px`.
- **Top Row:** Metric label in `label-md` (`#64748B`) uppercase, accompanied by a small contextual category icon.
- **Main Value:** `32px` bold font (`#0F172A`) showing Mean Score (e.g., `4.82 / 5.00`) or Overall Response Rate (`94.5%`).
- **Footer:** Tertiary emerald badge (`#CCFBF1` background, `#0F766E` text) showing positive percentage comparisons against agency benchmarks.

### 4. Input Fields & Text Areas
- **Styling:** Border `1px solid #CBD5E1`, internal padding `10px 14px`, text size `14px`.
- **Focus:** Border `#2563EB`, subtle shadow glow `0 0 0 3px rgba(37, 99, 235, 0.12)`.
- **Qualitative Comment Box:** Fixed height `120px` with a remaining character counter positioned in the bottom-right corner.

### 5. Data Tables (Project & Speaker Comparison)
- **Header:** Background `#F8FAFC`, uppercase `label-sm` (`#475569`), border bottom `2px solid #E2E8F0`.
- **Rows:** Zebra alternating striping optional; standard is pure white with `1px solid #F1F5F9` row dividers. Row hover: `#F8FAFC`.
- **Score Cell Display:** Tabular numbers aligned right, accompanied by a micro inline progress bar (`height: 6px`, color `#0D9488` for ≥4.0, `#D97706` for 3.0–3.9, `#DC2626` for <3.0).

### 6. Chips & Status Badges
- **Shape:** `4px` radius, padding `4px 10px`, typography `label-sm`.
- **Variants:**
  - *Completed / Validated:* Background `#E6FFFA`, text `#0D9488`.
  - *In Progress / Active:* Background `#EFF6FF`, text `#1D4ED8`.
  - *Pending Review:* Background `#FEF3C7`, text `#B45309`.