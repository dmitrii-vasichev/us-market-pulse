# Design Brief: US Market Pulse — Redesign

## Status: Approved
## Date: 2026-03-11
## Reference PRD: docs/prd-redesign.md

---

## Aesthetic Direction

**"Dark Editorial Finance"**

Inspiration: Bloomberg Terminal × Financial Times × Linear App

- Dark theme as primary (reduces eye strain, premium feel)
- Muted but distinctive palette: neutral tones + precise accents
- Editorial typography: character in headings, clear hierarchy

---

## Theme

- Mode: **Dark only**
- Style: Editorial / Financial / Premium

---

## Color Palette

```css
/* Backgrounds */
--bg-primary:     #0F1117;   /* near-black with slight blue undertone */
--bg-card:        #1A1D27;   /* cards slightly lighter than bg */
--bg-card-hover:  #22263A;   /* hover state */
--bg-elevated:    #252A3A;   /* elevated elements */

/* Text */
--text-primary:   #E8ECF1;   /* main text, not pure white */
--text-secondary: #8B93A7;   /* labels, captions */
--text-muted:     #555D73;   /* tertiary text */

/* Data colors — muted but distinguishable */
--data-teal:      #2DD4A8;   /* primary accent — growth, positive */
--data-coral:     #F97066;   /* negative, decline */
--data-amber:     #F5B731;   /* warnings, neutral trends */
--data-blue:      #60A5FA;   /* secondary data */
--data-purple:    #A78BFA;   /* tertiary data */
--data-slate:     #94A3B8;   /* baseline, reference */

/* Status */
--positive:       #2DD4A8;
--negative:       #F97066;
--neutral:        #94A3B8;
```

---

## Typography

| Role | Font | Notes |
|------|------|-------|
| Display / Headings | `Instrument Serif` or `DM Serif Display` | Editorial character |
| Body / UI text | `Satoshi` or `General Sans` | If unavailable: fallback to current DM Sans |
| Data / Numbers | `JetBrains Mono` | Monospace for aligned numeric columns |

**Do NOT use:** Inter, Roboto, Arial, system-ui as primary fonts.

### Type Scale
- KPI values: 32–40px, font-weight 600, `font-variant-numeric: tabular-nums`
- Section headings: 18–22px, display font
- Insight titles (chart headings): 14–16px, medium weight, not uppercase
- Labels: 10–11px, uppercase, letter-spacing 0.08em, `--text-muted`
- Micro-context: 11–12px, `--text-secondary`

---

## Layout

- Max content width: 1400px
- Base spacing: 4px scale
- Border radius: 12px (cards), 8px (inner elements)
- Card padding: 20–24px

---

## Component Standards

### Cards
- Background: `--bg-card`
- Border: 1px solid `rgba(255,255,255,0.06)`
- Hover: `--bg-card-hover`, `transform: translateY(-2px)`, enhanced shadow
- Shadow: `0 2px 8px rgba(0,0,0,0.3)` default, `0 8px 24px rgba(0,0,0,0.4)` hover

### ChartCard
- **title** (insight): 14–15px, `--text-primary`, font-weight 500 — the insight/conclusion
- **subtitle** (descriptor): 10–11px, uppercase, `--text-muted` — chart type description
- **source**: 10px, `--text-muted`, bottom-left — "Source: BEA · Q4 2025"

### KpiCard
- Label: 10px, uppercase, `--text-muted`
- Value: 36px, font-weight 600, tabular-nums, `--text-primary`
- Change: 12–13px, colored via `--positive`/`--negative`/`--neutral`
- Micro-context: 11px, `--text-secondary`, one line of economic context

### Header
- Background: `--bg-primary` / `--bg-card`, sticky
- Logo accent: `--data-teal`
- Active tab: `--data-teal` text + subtle teal background tint
- Border-bottom: `rgba(255,255,255,0.06)`

### Footer
- Background: `--bg-card`
- Sections: Methodology note + About section + Links
- Source links: styled as muted inline links

---

## Chart Principles

1. **Color carries meaning, not decoration** — one accent color for key insight, rest in muted tones
2. **Insight title = conclusion** — "GDP grew 1.4% in Q4" not "GDP Growth Components"
3. **Bar charts start at zero** — mandatory
4. **Negative values** — visually distinct (`--data-coral`)
5. **Max 6–8 categories** per chart without scroll
6. **Minimal chart junk** — light gridlines only, no borders, clean background
7. **Colorblind-friendly** — don't rely solely on color

### Nivo Theme (dark)
- Background: transparent (sits on `--bg-card`)
- Grid lines: `rgba(255,255,255,0.06)`
- Axis text: `--text-muted` (#555D73)
- Tooltip: dark background `--bg-elevated`, light text
- Labels: `--text-secondary`

---

## Responsive Breakpoints

- Desktop: 1400px max-width, 4-col KPI grid, 2-col chart grid
- Tablet (768px): 2×2 KPI grid, charts full-width
- Mobile (480px): KPI cards stacked, charts horizontal-scroll

---

## Accessibility

- `prefers-reduced-motion`: disable all animations
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text
- Focus indicators: visible on all interactive elements
