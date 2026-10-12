# Design Brief

## Direction

**Forest Discipline** — a private, mobile-first streak companion styled like a calm wellness ritual, not a productivity dashboard.

## Tone

Dark, grounded, and serene — deep forest-charcoal surfaces with a luminous mint streak ring; expressive Material 3 shapes executed with restraint so the streak stays the hero.

## Differentiation

The live streak counter sits inside a breathing, gradient-lit ring that subtly pulses — the same emerald motion language reappears as the SOS breathing circle, tying discipline and calm into one visual system.

## Color Palette

| Token      | OKLCH (dark)     | Role   |
| ---------- | ---------------- | ------ |
| background | 0.155 0.018 155  | forest near-black canvas |
| foreground | 0.93 0.01 150    | primary text |
| card       | 0.2 0.022 155    | elevated containers |
| primary    | 0.74 0.16 150    | emerald streak, active nav, CTA |
| accent     | 0.76 0.15 82     | warm gold secondary highlights |
| muted      | 0.24 0.025 155   | muted surfaces, locked badges |
| destructive| 0.62 0.17 20     | muted rose Relapse/Reset |

## Typography

- Display: Space Grotesk — streak numbers, screen titles, tight tracking
- Body: Figtree — labels, tips, history text
- Mono: JetBrains Mono — live timer digits
- Scale: hero `text-6xl font-bold tracking-tight`, h2 `text-2xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Three-tier surface hierarchy: `bg-background` canvas, `bg-card` containers with `shadow-elevated`, and `bg-secondary` inset chips; soft ambient depth only, never hard borders alone.

## Structural Zones

| Zone    | Background  | Border   | Notes                 |
| ------- | ----------- | -------- | --------------------- |
| Header  | bg-background | — | screen title + theme toggle, minimal |
| Content | bg-background | — | cards on canvas, 24–32px radii, generous gaps |
| Nav     | bg-card | border-t | 3-tab bottom bar, active tab emerald with pill highlight |
| SOS     | bg-background | — | centered breathing circle, calm negative space |

## Spacing & Rhythm

Spacious mobile rhythm: `px-5 py-6` screens, `gap-4` card stacks, `gap-2` micro-spacing inside chips and stat rows.

## Component Patterns

- Buttons: full-pill (`rounded-full`), emerald gradient primary, muted-rose destructive, spring scale on press
- Cards: `rounded-[2rem]` (extra-large) and `rounded-3xl` (large), `bg-card`, `shadow-elevated`
- Badges: pill chips, earned = `bg-primary/15 text-primary`, locked = `bg-muted text-muted-foreground`

## Motion

- Entrance: staggered `animate-rise` / `animate-fade-in-up`, 0.5s ease-out
- Hover/press: `transition-smooth`, scale 0.97 on press, 0.3s
- Decorative: streak ring `animate-streak-pulse` (2.6s), SOS circle `animate-breathe` (8s)

## Constraints

- Dark mode is the primary canvas; light mode mirrors the same emerald system
- Token-only styling — no raw hex, rgb, or arbitrary color classes
- High-contrast containers required; body text must stay AA+ readable

## Signature Detail

The breathing gradient ring — one motion choreography shared by the streak counter and the SOS circle, giving the app a single recognizable heartbeat.
