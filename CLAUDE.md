# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hilal Visibility Globe — an interactive 3D globe web app that projects lunar crescent (hilal) visibility predictions onto a world map. Helps Muslims determine when the new crescent moon should be visible at their location for the start of Islamic months.

Reference visual: https://www.moonsighting.com/1447rmd.html (flat-map images we replicate on a 3D globe).

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3 + Composition API + TypeScript)
- **State management**: Pinia
- **3D Globe**: Three.js / `three-globe`, CesiumJS, or d3 `geoOrthographic` on canvas
- **Astronomical calculations**: `astronomy-engine` npm package (Jean Meeus algorithms, browser-compatible, zero dependencies)
- **Styling**: Tailwind CSS, dark theme (base: `#060a14`)
- **Deployment**: Cloudflare Pages

## Commands

```bash
# Install dependencies
npm install

# Development server
npx nuxt dev

# Build for production
npx nuxt build

# Preview production build
npx nuxt preview

# Type checking
npx nuxi typecheck

# Linting (if configured)
npx nuxt lint
```

## Architecture: DDD + Vertical Slice + SOLID

### Layer Rules (dependencies point INWARD only)

```
UI Layer (pages/, components/)        → Vue/Nuxt-specific rendering
  ↓ calls
Application Layer (app/stores/, app/composables/) → Pinia stores orchestrate domain
  ↓ calls
Domain Layer (domain/)                → PURE TypeScript, ZERO framework imports
  ↓ uses
Infrastructure (app/workers/, assets/data/) → Web Workers, GeoJSON data
```

### Critical Constraint

The `domain/` folder must have **zero imports** from Vue, Nuxt, Pinia, d3, or any UI/framework library. It is pure TypeScript portable to browser, Node, or mobile. This is the project's most important architectural rule.

### Domain Layer Structure

- `domain/astronomy/` — Sun/moon position, sunset times, conjunction dates, crescent parameter computation (uses `astronomy-engine`)
- `domain/criteria/` — Visibility criteria implementing `ICriterion` interface. Each criterion is a function: `(CrescentParams) → VisibilityResult` with zone codes A/B/C/D/not-visible
- `domain/visibility/` — Grid computation across lat/lon points, GeoJSON polygon generation
- `domain/terminator/` — Day/night terminator line computation
- `domain/hijri/` — Approximate Hijri calendar date utilities
- `domain/models/` — Value objects: `CrescentParams`, `VisibilityResult`, `ZoneCode`, `GeoCoordinate`, `VisibilityGrid`

### Adding a New Criterion

1. Create `domain/criteria/NewCriterion.ts` implementing `ICriterion`
2. Register it in `domain/criteria/CriteriaRegistry.ts`
3. No store or component changes needed

### Key Astronomical Formulas

- **ARCV**: topocentric moon altitude − sun altitude at ~4 min after sunset
- **W** (crescent width): `SD × (1 − cos(ARCL))`, SD = moon semi-diameter (arcminutes)
- **ARCL**: angular separation sun↔moon (elongation)
- **DAZ**: azimuth difference sun↔moon
- **Moon age**: hours since conjunction

### Visibility Zones

| Code | Color | Meaning |
|------|-------|---------|
| A | `#9AF99B` light green | Easily visible naked eye |
| B | `#65A364` dark green | Visible if perfect conditions |
| C | `#EAC078` orange | Optical aid needed to find, then naked eye |
| D | `#E16665` red | Optical aid only |
| E | `#E8928E` light red | Crescent exists (conjunction before sunset) but not visible |
| NOT_VISIBLE | transparent | Crescent does not exist (conjunction after sunset or no sunset) |

Render order: worst zone first (E), best zone last (A) so better zones paint on top.

### Grid Computation

- Resolution ~2-4° lat/lon (4,050–16,200 points)
- Use Web Workers for heavy computation to keep UI responsive
- Cache results keyed by (date + criterion ID)
- Each cell → small GeoJSON polygon with slight overlap (0.2-0.3°) to avoid gaps

## Validation

Compare outputs against:
- moonsighting.com maps for Ramadan 1447 (Feb 18, 2026)
- ICOP (islamiccrescent.org) predictions
- Published astronomical conjunction tables
- Edge cases: polar regions (no sunset), equator, date line
