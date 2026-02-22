# Hilal Globe 🌙🌍
Interactive 3D globe for lunar crescent (hilal) visibility prediction — compare multiple astronomical criteria (Odeh, Yallop, Shaukat), view the day/night terminator, and plan moon sighting for any date.  [oai_citation:1‡GitHub](https://github.com/nuhatech/hilal-globe)

> **Purpose:** Help communities estimate when/where the new crescent moon *should* be visible for the start of Islamic months (e.g., Ramadan, Shawwal).

---

## What you can do
- **Pick any date** and compute predicted crescent visibility worldwide.
- **Switch criteria** to compare different prediction methods (e.g., Odeh / Yallop / Shaukat).  [oai_citation:2‡GitHub](https://github.com/nuhatech/hilal-globe)
- **Explore on a globe** (not just a flat map) for a more intuitive global picture.  [oai_citation:3‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/CLAUDE.md)
- **See the terminator** (day/night boundary) to understand local sunset context.  [oai_citation:4‡GitHub](https://github.com/nuhatech/hilal-globe)
- **Inspect visibility zones** (A/B/C/D/Not visible) representing different ease-of-visibility levels.  [oai_citation:5‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/CLAUDE.md)

---

## Visibility zones (A–D)
The app uses zone codes to describe how likely the crescent is to be seen (interpretation depends on the selected criterion).  [oai_citation:6‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/CLAUDE.md)

| Zone | Meaning (typical interpretation) |
|------|----------------------------------|
| **A** | Easily visible to the naked eye |
| **B** | Visible with perfect conditions |
| **C** | Optical aid may be needed to locate |
| **D** | Optical aid only |
| **—** | Not visible |

---

## Tech stack
- **Framework:** Nuxt 4 + Vue 3 + TypeScript  [oai_citation:7‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/package.json)  
- **State:** Pinia  [oai_citation:8‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/package.json)  
- **Astronomy:** `astronomy-engine` (Meeus-style algorithms, browser-friendly)  [oai_citation:9‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/package.json)  
- **Mapping / shapes:** `d3-geo`, `d3-contour`, `topojson-client`  [oai_citation:10‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/package.json)  
- **Styling:** Tailwind CSS + dark theme  [oai_citation:11‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/package.json)  
- **i18n:** `@nuxtjs/i18n` (currently EN/FR configured)  [oai_citation:12‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/nuxt.config.ts)  
- **Deployment:** Cloudflare Pages (recommended)  [oai_citation:13‡GitHub](https://raw.githubusercontent.com/nuhatech/hilal-globe/main/CLAUDE.md)  

---

## Quick start

### Prerequisites
- Node.js (modern LTS recommended)
- npm (or pnpm/yarn/bun)

### Install
```bash
npm install

Run locally

npm run dev

Then open: http://localhost:3000

Build / preview

npm run build
npm run preview

Static generation

npm run generate


⸻

Project architecture (Domain-first)

This repo is organized to keep astronomy + visibility logic framework-agnostic. The domain/ folder is pure TypeScript and must not import Vue/Nuxt/Pinia/d3/etc.  ￼

Dependency direction (inward only):

UI (pages/, components/)
  ↓
Application (app/stores/, app/composables/)
  ↓
Domain (domain/)   ← pure TS, portable
  ↑
Infrastructure (workers, data, geojson)

￼

Domain modules (high-level)
	•	domain/astronomy/ — sun/moon positions, conjunction, sunset timing, crescent parameters (via astronomy-engine)  ￼
	•	domain/criteria/ — criteria implementations (each returns a zone result)  ￼
	•	domain/visibility/ — grid computation + polygon generation  ￼
	•	domain/terminator/ — day/night terminator computation  ￼
	•	domain/hijri/ — approximate Hijri date utilities  ￼

⸻

Adding a new visibility criterion
	1.	Create a new file: domain/criteria/MyCriterion.ts implementing the shared interface.  ￼
	2.	Register it in domain/criteria/CriteriaRegistry.ts.  ￼
	3.	Done — UI/stores should not need changes if the registry is used consistently.

⸻

Validation / references

This project is intended to be cross-checked against known public prediction maps and tables, for example the reference-style visuals on moonsighting.com (the globe view aims to replicate similar information in 3D).  ￼

Suggested validation sources:
	•	moonsighting.com predicted visibility maps  ￼
	•	ICOP predictions (islamiccrescent.org)  ￼
	•	published conjunction tables and edge-case testing (polar regions, date line, etc.)  ￼

⸻

Notes & disclaimer

This is a prediction and planning tool, not an observation claim. Actual visibility depends on atmosphere, optics, terrain, observer experience, and local conditions.

⸻

Contributing

Contributions are welcome:
	•	bug fixes and performance improvements
	•	new criteria implementations
	•	UI/UX enhancements
	•	better documentation and translations (EN/FR already scaffolded)  ￼

If you’re adding domain logic, please keep domain/ free of framework imports.  ￼

⸻

License

MIT License

Copyright (c) 2026 NuhaTech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

⸻

Acknowledgements
	•	astronomy-engine for reliable ephemeris-style computations.  ￼
	•	Inspiration/reference visuals: moonsighting.com maps (flat map style replicated onto a globe).  ￼