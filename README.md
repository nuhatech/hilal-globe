# Hilal Globe 🌙🌍

Interactive 3D globe for lunar crescent (hilal) visibility prediction.  
Compare multiple astronomical criteria (Odeh, Yallop, Shaukat), visualize global visibility zones, and explore the day/night terminator for any date.

> A scientific visualization tool to help estimate where the new crescent moon may be visible for the beginning of Islamic months (e.g., Ramadan, Shawwal).

---

## ✨ Features

- 🌍 Interactive 3D globe visualization  
- 📅 Select any date for prediction  
- 📐 Multiple visibility criteria (Odeh, Yallop, Shaukat)  
- 🌗 Real-time day/night terminator rendering  
- 🗺 Visibility zones (A, B, C, D, Not visible)  
- 🌐 Internationalization support (EN / FR)  
- ⚡ Domain-driven architecture (astronomy logic separated from UI)

---

## 🔎 Visibility Zones

| Zone | Meaning |
|------|----------|
| **A** | Easily visible to the naked eye |
| **B** | Visible under perfect conditions |
| **C** | May require optical aid to locate, then naked eye |
| **D** | Optical aid only |
| **E** | Crescent exists but not visible |
| **—** | Crescent does not exist (conjunction after sunset or no sunset) |

Zone interpretation depends on the selected astronomical criterion.

---

## 🧠 Architecture

The project follows a **domain-first architecture**.

UI (pages/, components/)
↓
Application layer (stores/, composables/)
↓
Domain (pure TypeScript)
↑
Infrastructure (workers, geo data)

### Domain Modules

- `domain/astronomy/` — Sun & Moon positions, conjunction, sunset timing  
- `domain/criteria/` — Visibility criteria implementations  
- `domain/visibility/` — Global grid computation & contour generation  
- `domain/terminator/` — Day/night boundary calculation  
- `domain/hijri/` — Hijri date utilities  

The `domain/` folder is framework-agnostic and contains no Vue/Nuxt imports.

---

## 🛠 Tech Stack

- Nuxt 4  
- Vue 3 + TypeScript  
- Pinia  
- astronomy-engine  
- d3-geo / d3-contour  
- Tailwind CSS  
- Cloudflare Pages (recommended deployment)

---

## 🚀 Installation

### Prerequisites

- Node.js (LTS recommended)
- npm (or pnpm/yarn/bun)

### Install dependencies

```bash
npm install
```

Run locally

```bash
npm run dev
```

Open: http://localhost:3000

Build for production

```bash
npm run build
npm run preview
```

Generate static site

```bash
npm run generate
```

⸻

➕ Adding a New Visibility Criterion
1. Create a new file in domain/criteria/
2. Implement the shared criterion interface
3. Register it in CriteriaRegistry

No UI changes should be required if the registry pattern is respected.

⸻

⚖️ Disclaimer

This software provides astronomical predictions only.
Actual crescent visibility depends on atmospheric conditions, observer experience, optics, altitude, and local environment.

This tool does not replace official religious or community moon sighting decisions.

⸻

📖 Citation

If you use this project in research, publications, or public work, please cite:

Hilal Globe (2026). Lunar Crescent Visibility Prediction Tool.
GitHub Repository. Available at: https://github.com/nuhatech/hilal-globe


⸻

📜 License

MIT License

Copyright (c) 2026 Nuhatech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.