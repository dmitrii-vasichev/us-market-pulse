# Design Brief: US Market Pulse

## UI Framework
- Library: Nivo (`@nivo/*`) for all charts
- CSS: Tailwind CSS
- Components: Custom (no component library — clean minimal design)

## Theme
- Mode: Light only (MVP)
- Style: Clean, airy, Scalix SaaS Dashboard inspired
- Reference: Scalix SaaS Dashboard (Dribbble) — white cards, generous whitespace, diverse chart types on one screen

## Color Palette
```
--bg:             #F9FAFB   (very light gray — page background)
--card:           #FFFFFF   (white — card background)
--card-border:    #F3F4F6   (almost invisible border)
--card-shadow:    0 1px 3px rgba(0,0,0,0.04)

--text-primary:   #111827   (dark gray — headings, values)
--text-secondary: #6B7280   (medium gray — labels, axis)
--text-muted:     #9CA3AF   (light gray — hints, period labels)

--accent-blue:    #3B82F6   (primary accent)
--accent-green:   #10B981   (positive delta)
--accent-red:     #EF4444   (negative delta)
--accent-amber:   #F59E0B   (warning, neutral)
--accent-purple:  #8B5CF6   (secondary charts)
--accent-pink:    #EC4899   (tertiary)
--accent-orange:  #F97316   (funnel, highlights)
```

## Nivo Color Scheme
- Multi-series charts: `'set2'` or `'paired'`
- Single-series: custom single-color gradients
- Waterfall: blue (positive), red (negative), green (total)

## Typography
- Font: **DM Sans** (Google Fonts) — clean, modern, distinctive
- KPI values: 28-32px, font-weight 700
- Card titles: 10-11px, font-weight 600, uppercase, tracking-wide, text-muted
- Axis labels: 10-11px, text-secondary
- Body: 14px, regular weight

## Layout
- 3-tab navigation: Overview | Labor & Economy | Markets & Sectors
- Sticky header with tab navigation
- Footer with tech credits
- Max content width: `max-w-7xl` (1280px)
- Page background: `bg-gray-50` (#F9FAFB)

## Cards
- Style: `bg-white rounded-2xl border border-gray-100 shadow-sm p-5`
- Hover: `shadow-md` transition (200ms)
- Title: uppercase, tracking-wide, 10-11px, muted color
- Optional "View more" link in card header

## KPI Strip (special — NO card borders)
- Plain numbers on white background, Scalix style
- Value: 28-32px, font-weight 700, text-primary
- Colored arrows: green/red based on economic meaning (see PRD Section 9)
- Small sparkline below each value: 80px × 32px (Nivo mini line)
- Period label in text-muted

## Nivo Theme Config
```typescript
export const nivoTheme = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 11,
  textColor: '#6B7280',
  grid: { line: { stroke: '#F3F4F6', strokeWidth: 1 } },
  axis: {
    ticks: { text: { fontSize: 10, fill: '#9CA3AF' } },
    legend: { text: { fontSize: 11, fill: '#6B7280', fontWeight: 600 } },
  },
  tooltip: {
    container: {
      background: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid #F3F4F6',
      fontSize: '12px',
      fontFamily: 'DM Sans, sans-serif',
    },
  },
  labels: { text: { fontSize: 11, fontWeight: 600 } },
};
```

## Component Standards
- Buttons: rounded-lg, subtle, minimal use
- Cards: rounded-2xl, thin border, light shadow
- Tables: clean, minimal borders, alternating row shading
- Charts: always use `Responsive*` Nivo variants, `animate={true}`

## Responsive Behavior
- Desktop: multi-column grid as specified in PRD layout
- Tablet: 2-column where possible, stack otherwise
- Mobile: single column, full-width charts
