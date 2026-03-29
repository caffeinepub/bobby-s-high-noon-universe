# Bobby's High Noon Universe

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full single-page app: Bobby's High Noon Universe
- Hero section with animated intro, floating cans, particles, glowing CTA
- Bobby Energy Meter with animated gauge (4 levels: Mildly Bobby → Astral Noon Bobby)
- Interactive High Noon Constellation Map — clickable floating cans that reveal Bobby Lore
- Bobby Hall of Greatness — animated award cards gallery
- Mini-game: tap to generate dramatic Bobby compliments
- Finale section with confetti, rising cans, cinematic celebration
- Golden-hour palette: sunset oranges, pool blues, silver, neon accents, crisp white
- Glassmorphism panels, soft glow effects, parallax motion, floating objects
- Funny microcopy throughout

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Build App.tsx as single scrollable page with 6 sections
2. Hero: full-viewport animated section with floating CSS cans, particle shimmer, glowing CTA button that triggers Bobby Mode state
3. Energy Meter: animated SVG/CSS gauge component with 4 Bobby levels, auto-animating needle
4. Constellation Map: absolute-positioned can icons in a dark space-themed panel, click to reveal lore tooltips
5. Hall of Greatness: grid of glass-morphism award cards with hover animations
6. Compliment Generator: tap button → random compliment appears with dramatic animation
7. Finale: full-viewport cinematic section, CSS confetti animation, rising cans, Honor Bobby Again button that scrolls back to top
8. All animations via Tailwind + inline CSS keyframes + framer-motion if available, else CSS animations
9. Responsive layout, golden-hour color tokens in index.css
