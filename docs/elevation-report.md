# Observer Elevation and Hilal Visibility Criteria

**Technical Analysis, Physical Foundations, and Implementation Plan**
*Hilal Visibility Globe App — Reference Document*

---

## 1. Are the Criteria "Sea Level Only"?

A common claim in hilal observation communities is that standard visibility criteria are **"based on sea level"** and therefore underestimate visibility for observers at higher elevations. This section examines each major criterion to determine the precise role of observer elevation in its formulation.

The short answer: **none of the five major criteria explicitly include observer elevation as a parameter**. However, they are not strictly "sea level" either — it is more accurate to call them **elevation-agnostic**, meaning elevation was never controlled for, recorded, or factored into the calibration datasets. This is a meaningful distinction.

### 1.1 Yallop (1997) — q-value Criterion

**Source:** NAO Technical Note No. 69, Royal Greenwich Observatory. 295 observations from Schaefer's database (1859–1996).

**Coordinate system:** Geocentric ARCV (no parallax, no refraction). This is the most critical point — geocentric coordinates *by definition* ignore the observer's position on Earth. Both latitude and elevation are removed from the computation. The Moon's position is calculated as if observed from the center of the Earth.

**Elevation in formula:** None. The q-value polynomial `q = (ARCV − ARCV*) / 10` has no elevation term. The threshold curve `ARCV* = 11.8371 − 6.3226W′ + 0.7319W′² − 0.1018W′³` depends only on crescent width W′.

**Elevation in calibration data:** The 295 observations came from various global locations at unrecorded elevations. Elevation was never a controlled or recorded variable in the dataset. Observations from sea-level coastal sites and high-altitude observatories were mixed indiscriminately.

**Verdict:** Yallop's criterion is **genuinely elevation-blind**. The geocentric coordinate system removes any positional advantage an elevated observer would have. An observer at 3000m sees no difference in the q-value compared to one at sea level for the same (lat, lon, date) — even though their actual visibility conditions differ significantly.

### 1.2 Odeh (2006) — V-value Criterion

**Source:** "New Criterion for Lunar Crescent Visibility," *Experimental Astronomy* 18:39–64. 737 observations from the ICOP database.

**Coordinate system:** Topocentric airless ARCV (parallax-corrected, no refraction). The parallax correction does account for the observer's distance from Earth's center, which changes slightly with elevation. However, this effect is tiny: being 2000m higher changes the Moon's parallax by approximately 0.02′ (0.3 arcseconds) — negligible compared to the 1°+ zone widths.

**Elevation in formula:** None. `V = ARCV − (−0.1018W³ + 0.7319W² − 6.3226W + 7.1651)` contains no elevation term. The constant 7.1651 was calibrated against the 737-observation dataset.

**Elevation in calibration data:** The ICOP database contains observations from varied locations worldwide. Observer elevation was not used as a variable in the regression analysis that produced the polynomial coefficients.

**Verdict:** Topocentric coordinates provide a *marginal* elevation sensitivity through parallax, but the effect is negligible (~0.3″). For all practical purposes, **Odeh is elevation-agnostic**.

### 1.3 Shaukat (moonsighting.com)

**Source:** Unpublished. Developed by Syed Khalid Shaukat based on ~900 observations. Not peer-reviewed.

**Coordinate system:** Uses topocentric Moon altitude M at sunset. The altitude value will reflect the observer's elevation if passed correctly to the computation engine, but only through the tiny parallax shift.

**Elevation in formula:** None. The threshold `(M/12.7) + (W/1.2) > 1` was not derived with elevation as a factor. The minimum Moon altitude of 3.4° was calibrated against observations where elevation was not controlled.

**Verdict:** **Elevation-agnostic**. Additionally, because the criterion is unpublished, it is impossible to verify what assumptions were made about observer height.

### 1.4 SAAO (Caldwell & Laney 2001)

**Source:** "First Visibility of the Lunar Crescent," *African Skies (MNASSA)* No. 5:15–23.

**Coordinate system:** Uses DALT (apparent altitude of Moon's lower limb at sunset) vs. DAZ. The use of "apparent" altitude means atmospheric refraction is included, which is a positive step. The refraction model itself could theoretically be elevation-dependent (lower pressure at altitude changes refraction), but the SAAO criterion uses a standard refraction model.

**Elevation in calibration data:** South Africa's Sutherland Observatory is at ~1800m elevation. This means the calibration data *implicitly* included some elevation benefit — but it was not factored as an explicit variable.

**Verdict:** **Partially elevation-aware by accident** (Sutherland's 1800m elevation baked into the calibration), but elevation is not an explicit parameter.

### 1.5 Istanbul 1978 Criterion

**Source:** Istanbul Conference for Hijri Month Determination (1978). Reaffirmed 2016.

**Thresholds:** Three simple conditions: (1) Conjunction before sunset, (2) Moon altitude > 5° at sunset, (3) Elongation > 8° at sunset.

**Elevation in formula:** None. The 5° and 8° thresholds are fixed constants with no elevation parameter. If the position calculator accounts for the observer's elevation (via topocentric correction), the computed Moon altitude will be very slightly different, but the threshold itself was not calibrated for different altitudes.

**Verdict:** **Elevation-agnostic**. The deliberately conservative thresholds (5° altitude, 8° elongation) may partially compensate — these are high enough that elevation corrections of ~1° rarely change the outcome.

### 1.6 Summary: Elevation Handling Across Criteria

| Criterion | Coord. System | Elevation Term | Calibration Data | Verdict |
|---|---|---|---|---|
| Yallop (1997) | Geocentric | None | 295 obs, elev. not recorded | Fully elevation-blind |
| Odeh (2006) | Topocentric airless | None (parallax ~0.3″) | 737 obs, elev. not used | Elevation-agnostic |
| Shaukat | Topocentric | None | ~900 obs, unpublished | Elevation-agnostic |
| SAAO (2001) | Apparent (refracted) | None explicit | Sutherland @1800m implicit | Accidentally partial |
| Istanbul 1978 | Varies by impl. | None | Expert consensus, no dataset | Elevation-agnostic |

**Conclusion:** The claim that criteria are "based on sea level" is an oversimplification, but the underlying concern is valid. None of the five major criteria account for elevation, and the physical advantages of elevated observation (lower horizon, reduced extinction, darker sky) are real and measurable. Observers at significant altitude have a legitimate reason to expect better visibility than these criteria predict.

---

## 2. Why Elevation Matters — The Physics

There are three distinct physical mechanisms by which observer elevation improves crescent visibility. They differ vastly in magnitude.

### 2.1 Horizon Dip (Geometric) — The Dominant Effect

An observer elevated above sea level can see further around the curvature of the Earth. The geometric horizon drops below the astronomical horizontal plane by an angle called the **dip**. This is the single most important elevation effect for hilal visibility.

#### Formula

The geometric horizon dip (without atmospheric refraction) is:

```
dip_geometric = arccos(R / (R + H))  ≈  √(2H / R)  radians
```

Where R = Earth's radius (6,371,000 m) and H = observer height above sea level in meters.

Converting to degrees:

```
dip_geometric ≈ 0.0325 × √H  degrees
```

Accounting for standard atmospheric refraction (refraction coefficient k = 0.143, which bends light downward, effectively shrinking the dip):

```
dip_refracted ≈ 0.0293 × √H  degrees
```

This is the formula used in nautical navigation and astronomical calculations. It represents how much the apparent horizon drops, which has two cascading effects:

**Effect 1 — Later effective sunset:** The sun remains visible longer from an elevated position because the observer can see it below the sea-level horizon. Sunset occurs later by approximately `(dip / 15°) × 60 min × sec(φ)`, where φ is latitude. At 1000m, this is roughly 2–3 extra minutes of daylight.

**Effect 2 — Higher Moon above visible horizon:** At any given moment after sea-level sunset, the Moon appears higher above the observer's visible horizon by approximately the dip angle. For a borderline crescent at 4° altitude at sea-level sunset, an observer at 1000m effectively sees the Moon ~5° above their visible horizon.

#### Dip Values at Common Elevations

| Elevation (m) | Geometric Dip | Refracted Dip | Practical Impact |
|---|---|---|---|
| 50 | 0.23° | 0.21° | Small but measurable |
| 100 | 0.32° | 0.29° | Detectable difference |
| 200 | 0.46° | 0.41° | Noticeable improvement |
| 500 | 0.73° | 0.66° | Nearly half a degree gained |
| 1,000 | 1.02° | 0.93° | Significant — ~1° advantage |
| 2,000 | 1.44° | 1.31° | Major advantage |
| 3,000 | 1.76° | 1.60° | Substantial — 1.5°+ shift |
| 4,000 | 2.04° | 1.85° | Enormous advantage |

For reference, the width of Yallop's visibility zones is typically 0.05°–0.23° in ARCV terms. A 1° shift from elevation at 1000m can therefore **move the prediction by several full zone categories**.

### 2.2 Reduced Atmospheric Extinction — Moderate Effect

At higher elevation, there is less atmosphere above the observer. This produces three benefits:

**Crescent appears brighter:** Less light is absorbed along the optical path from the Moon to the observer. Atmospheric pressure at elevation H (meters) follows approximately:

```
P(H) ≈ P₀ × exp(−H / 8500)    where P₀ = 1013.25 mbar
```

At key elevations:

| Elevation | Pressure (mbar) | % of Sea Level | Extinction Reduction |
|---|---|---|---|
| Sea level | 1013 | 100% | Baseline |
| 500m | 955 | 94% | ~6% less extinction |
| 1,000m | 899 | 89% | ~11% less extinction |
| 2,000m | 795 | 78% | ~22% less extinction |
| 4,000m | 616 | 61% | ~39% less extinction |

The optical path at the horizon is ~38× the zenith path (air mass X ≈ 38 at 0° altitude). The extinction is roughly proportional to air mass × atmospheric opacity. Less atmosphere means both **brighter crescent** and **darker twilight sky**, improving the contrast ratio that determines whether the eye can detect the crescent.

Schaefer's physical visibility model (1987–2000) is the only criterion that accounts for atmospheric extinction explicitly, using surface pressure and temperature as inputs. All other criteria use empirical thresholds that implicitly assume "average" atmospheric conditions.

### 2.3 Topocentric Parallax Shift — Negligible Effect

Being 2000m higher moves the observer ~2 km farther from Earth's center (vs. 6371 km radius). This changes the Moon's horizontal parallax by:

```
ΔHP ≈ HP × (H / R) ≈ 57′ × (2000 / 6,371,000) ≈ 0.018′ ≈ 1.1″
```

This is approximately 1 arcsecond — completely negligible compared to the 1′ precision of any criterion. **This mechanism can be safely ignored.**

### 2.4 Relative Importance of Mechanisms

| Mechanism | Effect at 1000m | Impact on Visibility | Modellable? |
|---|---|---|---|
| Horizon dip | +0.93° | Dominant — shifts ARCV by ~1° | Yes, simple formula |
| Reduced extinction | ~11% less | Moderate — improves contrast | Complex, needs atmosphere model |
| Parallax shift | +1.1″ | Negligible | Already in astronomy-engine |

---

## 3. How Significant Is It in Practice? — Özlem's Research

Abdurrahman Özlem (Istanbul, Turkey) is the researcher who has most rigorously studied the effect of observer elevation on crescent visibility. His work spans two key papers: *A Simplified Crescent Visibility Criterion* (2014) and *The Extended Crescent Visibility Criterion* (2017), both presented at ICOP conferences and published on astronomycenter.net.

### 3.1 Özlem's Elevation-Aware Criterion

Özlem reformulated the Yallop/Odeh visibility function by splitting ARCV into its two physical components — Moon altitude (M) and Sun depression (S) — and adding an explicit elevation correction:

```
V = -0.28/tan(M+1.5) – min(S,5) + 6×√min(W,5) + arccos(R/(R+H)) – P/50 > 3.9
```

Where:

- **M** = topocentric Moon altitude (degrees)
- **S** = Sun depression below horizon (degrees, positive value)
- **W** = crescent width (arcminutes)
- **R** = Earth's radius (6,371 km)
- **H** = observer height above sea level (km)
- **P** = probability percentage (0–100)

The elevation correction term is **arccos(R / (R + H))** — this is precisely the geometric horizon dip formula. By adding it to the visibility function, Özlem directly compensates for the lowered horizon that an elevated observer experiences.

### 3.2 Quantified Impact: The k Constant

Özlem also analyzed the effect through the lens of the Yallop/Odeh constant k (the threshold intercept). He showed that the constant varies with elevation:

| Elevation | k Value | Δk from Sea Level | Equivalent ARCV Shift |
|---|---|---|---|
| Sea level | 12.4 | 0.0 | Baseline |
| 1,000m | 11.4 | −1.0 | +1.0° |
| 2,000m | 10.8 (est.) | −1.6 | +1.6° |
| 4,000m | 10.4 | −2.0 | +2.0° |

The difference of 1.0 in k at 1000m is equivalent to roughly **+1° of ARCV**. To put this in perspective:

In the Yallop criterion, the zones are defined by q-value ranges: A (q > +0.216), B (−0.014 < q ≤ +0.216), C (−0.160 < q ≤ −0.014). Since q = (ARCV − ARCV*) / 10, a 1° ARCV shift translates to a q-shift of +0.10 — which is **nearly half the width of zone B** (0.230 wide). This means elevation can easily push a borderline Zone C ("may need optical aid") prediction into Zone B ("visible under perfect conditions").

### 3.3 Practical Example: Ramadan 1447 AH — February 18, 2026

Consider the evening of February 18, 2026 for an observer in Marrakech, Morocco:

| Parameter | Sea Level (coast) | 1,500m (Atlas foothills) |
|---|---|---|
| Moon altitude (topocentric) | ~10.5° | ~10.5° (same) |
| Visible horizon depression | 0° | ~1.14° lower |
| Effective Moon above horizon | ~10.5° | ~11.6° |
| Effective sunset delay | Baseline | ~2–3 minutes later |
| Atmospheric extinction | Baseline | ~16% less |
| Net visibility advantage | Baseline | +1.0° to +1.3° effective |

While in this example both observers would likely see the crescent (it is day+1 with strong geometry), the difference becomes critical on marginal evenings — for instance, attempting observation on the conjunction evening itself (Feb 17), where an observer in the Atlas Mountains might have a legitimate chance with binoculars while a sea-level observer would not.

### 3.4 Key Insight: It Matters Most at the Margins

Elevation corrections are **irrelevant** when the crescent is clearly visible (Zone A, high above horizon) or clearly invisible (below Danjon limit). They matter most in the **marginal zone** — Yallop zones B–D, Odeh zones B–C — which is precisely where religious and communal debates about hilal sighting occur. An elevation-sensitive mode directly addresses the most contentious use case.