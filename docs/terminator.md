# Day/Night Terminator

## What Is It?

The **terminator** is the line on the globe that separates the sunlit (day) side of the Earth from the dark (night) side. At any given moment, exactly half of the Earth faces the sun and the other half is in shadow. The boundary between them is the terminator line.

On the globe, it appears as:

- A **dark semi-transparent overlay** covering the night half of the Earth
- A **subtle amber/gold line** along the boundary itself

## How Does It Work?

The terminator is tied to the **selected date** in the date picker — not to the current real-world time.

It shows where day and night fall **on the selected date at 18:00 UTC**. This time was chosen because it roughly corresponds to sunset in the Middle East and East Africa — key regions for early hilal sighting. When you switch to a different date (e.g. from Feb 18 to Feb 19), the terminator shifts to show the day/night boundary for that new date.

The 18:00 UTC snapshot means:
- Regions east of ~30°E longitude (India, SE Asia, Australia) → already past sunset (dark side)
- Regions around 20-40°E (Middle East, East Africa) → near the terminator line (sunset happening)
- Regions west of ~20°E (Europe, Americas) → still daytime (bright side)

## Why Does It Matter for Hilal Sighting?

The crescent moon (hilal) can only be observed **just after sunset** — in the narrow window between when the sun dips below the horizon and the sky becomes too dark. The terminator shows exactly where that sunset boundary falls on the selected date.

### 1. It Shows Where Sunset Has/Hasn't Happened

The terminator line is the set of all points on Earth where the sun is on the horizon at that moment. The dark side has already had sunset, the bright side hasn't yet.

### 2. It Gives the Visibility Zones Context

Without the terminator, the colored visibility zones (green, orange, red) float on the globe without a clear sense of timing. With the terminator, the relationship becomes intuitive:

- **Zones in the dark area** (night side) — sunset already happened here. If the zone is green, people in this region have already had their chance to see the hilal.
- **Zones along the terminator line** — sunset is happening around this time. These are the locations where observers would be actively looking.
- **Zones in the bright area** (day side) — sunset hasn't happened yet. These locations will get their observation window as the Earth continues to rotate.

## How to Read the Globe

```
   Bright side          Terminator line          Dark side
   (daytime)            (sunset/sunrise)         (nighttime)
                              |
   Sun is still up     Sun on horizon        Sun already set
   Sunset coming       Observation window     Observation window
   later               happening             has passed
```

When you combine this with the visibility zones:

| What You See | What It Means |
|---|---|
| Green zone in the dark area | Best region — hilal was likely visible at sunset there |
| Green zone along the terminator | Hilal visible here at sunset time |
| Green zone in the bright area | Hilal will be visible here when sunset arrives |
| Red/orange zone along the terminator | Difficult sighting conditions at these sunset locations |
| No zone color at all | Hilal is not visible from this region regardless of sunset |

## Technical Details

- The terminator is computed using the **subsolar point** — the latitude/longitude where the sun is directly overhead on the selected date at 18:00 UTC
- The night side is the opposite hemisphere: a circle of 90 degrees radius centered on the **antisolar point** (opposite of the subsolar point)
- Uses the `astronomy-engine` library for precise solar position calculations
- Rendered using d3-geo's `geoCircle()` which handles spherical geometry and projection clipping automatically
- Changes automatically when you select a different date
- Can be toggled on/off via the gear icon in the header (enabled by default)
