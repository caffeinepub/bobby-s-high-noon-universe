# Bobby's High Noon Universe — Mini Games Page

## Current State
App.tsx is a single-page experience (~2287 lines) with: Hero, Energy Meter, Constellation Map, Hall of Greatness, Compliment Generator, and Finale sections. NavBar has links to the sections. No real mini-games exist.

## Requested Changes (Diff)

### Add
- `MiniGamesPage.tsx` — a full-page mini-games hub with a game selector and 3 playable games
- `CanCatcher.tsx` — Game 1: Arcade can-catcher. Cans fall from the top, player moves a Bobby paddle left/right (mouse/touch) to catch High Noon cans. Different flavors worth different points, beer bombs to dodge. Speed increases over time. Lives system. High score stored in localStorage.
- `CanStack.tsx` — Game 2: Precision stacking. A can slides back and forth at the top of the screen; click/tap to drop it. Stack must align with the platform below or it gets trimmed (Tetris-stack style). Tower grows upward. Combo scoring for perfect drops. High score stored in localStorage.
- `NoonFrenzy.tsx` — Game 3: Whack-a-mole style. High Noon cans pop up from random holes on a grid. Click/tap them before they disappear. Timer-based (30 seconds). Harder waves with more holes activating at once. Bobby-themed flavor text on combos. High score stored in localStorage.
- Nav link "Arcade" added to NavBar and mobile menu, linking to the games page (using a `page` state toggling between main and games)

### Modify
- `App.tsx` — Add `page` state ('main' | 'games'). Conditionally render MiniGamesPage vs main content. Pass navigation handlers to NavBar and MiniGamesPage.
- `NavBar` — Add "Arcade 🕹️" button that navigates to the games page

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/games/CanCatcher.tsx` — canvas-based arcade game using requestAnimationFrame
2. Create `src/frontend/src/games/CanStack.tsx` — canvas or DOM-based stacking game with requestAnimationFrame
3. Create `src/frontend/src/games/NoonFrenzy.tsx` — React state-based whack-a-mole game
4. Create `src/frontend/src/games/MiniGamesPage.tsx` — hub page with game cards, game selector, back button
5. Modify `App.tsx` — add page state and wire up navigation
6. Validate and fix any TypeScript/lint errors
