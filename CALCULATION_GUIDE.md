# Lunar crescent visibility prediction: a complete implementation reference

**The prediction of first lunar crescent (hilal) visibility reduces to a two-variable polynomial test** — arc of vision (ARCV) versus crescent width (W) — evaluated at an optimal observation time after local sunset. The Yallop (1997) and Odeh (2006) criteria dominate modern implementations, both using the same third-degree polynomial with different constant terms and coordinate conventions. This report provides every formula, threshold, and implementation detail needed to build a working hilal visibility calculator from scratch.

The core pipeline is: compute the new moon conjunction time, find local sunset, determine "best time" for observation, calculate the Sun/Moon positions in horizontal coordinates at that time, derive the geometric parameters (ARCV, ARCL, W, DAZ), and apply a visibility criterion to classify the result. All major astronomical calculations follow Jean Meeus's *Astronomical Algorithms* (2nd ed., 1998), and the `astronomy-engine` npm library can replace most low-level ephemeris work.

---

## 1. Astronomical parameters and their physical meaning

Each parameter captures a different aspect of the Sun-Moon-observer geometry at the time of potential crescent observation. Understanding what each represents physically is essential for correct implementation.

**ARCV (Arc of Vision)** is the altitude difference between the Moon's center and the Sun's center, measured in degrees. At the best observation time the Sun is below the horizon, so ARCV = altitude_moon − altitude_sun (with altitude_sun being negative). A larger ARCV means the Moon is higher above the Sun, making the sky darker near the crescent and improving visibility. Yallop uses **geocentric** ARCV (no parallax or refraction correction); Odeh uses **topocentric airless** ARCV (parallax-corrected but no atmospheric refraction).

**ARCL (Arc of Light / Elongation)** is the angular separation between the centers of the Sun and Moon, in degrees. It determines how much of the Moon's surface is illuminated. The exact formula from horizontal coordinates is:

```
cos(ARCL) = sin(alt_sun)·sin(alt_moon) + cos(alt_sun)·cos(alt_moon)·cos(DAZ)
```

For small angular separations near the horizon, the approximation **ARCL² ≈ ARCV² + DAZ²** holds reasonably well. From equatorial coordinates: `cos(ARCL) = sin(δ_s)·sin(δ_m) + cos(δ_s)·cos(δ_m)·cos(α_m − α_s)`.

**W (Crescent Width)** is the angular width of the illuminated portion of the Moon at its widest point, measured in **arcminutes**:

```
W = SD × (1 − cos(ARCL))
```

where **SD** is the Moon's semi-diameter in arcminutes. W ranges from 0 (new moon) to about 1.0 arcminutes for a crescent that is **12–15 hours old** and easily visible. This is the single best proxy for crescent brightness.

**DAZ (Delta Azimuth)** is the difference in azimuth between the Moon and the Sun: `DAZ = Az_moon − Az_sun`, in degrees. A large DAZ means the crescent is far from the bright glow near the sunset point, improving contrast. In Yallop's convention, DAZ = Az_sun − Az_moon.

**SD (Semi-Diameter)** is the Moon's apparent angular radius, typically **14.7′ to 16.7′**, computed as:

```
SD (arcminutes) = asin(1737.4 / Δ) × (180/π) × 60
```

where Δ is the Moon's distance in km. The approximation **SD ≈ 358473 / Δ_km** (in arcminutes) is accurate to ~0.1″.

**HP (Horizontal Parallax)** is the angle subtended by the Earth's equatorial radius at the Moon's distance:

```
HP = asin(6378.14 / Δ)
```

HP ranges from **53.9′ to 61.5′** and is related to SD by **SD = 0.2725 × HP**. HP is critical for the topocentric parallax correction that shifts the Moon's apparent altitude by up to ~1° when near the horizon.

**Moon Age** is the elapsed time since conjunction (new moon), in hours:

```
Age = (JD_observation − JD_conjunction) × 24
```

While not used directly in the Yallop/Odeh polynomial, age serves as a sanity check — crescents younger than about **15 hours** are almost never visible to the naked eye, and those younger than **12 hours** are virtually impossible even with optical aid.

**Sun Depression** at best time is the Sun's altitude below the horizon (positive value), typically **3°–5°** at the optimal observation moment. It quantifies sky darkness near the crescent.

---

## 2. The complete computation pipeline

### Julian Date and Julian Century

Given a Gregorian calendar date (Y, M, D with decimal hours), the Julian Date is computed using Meeus Chapter 7:

```
If M ≤ 2: Y = Y − 1, M = M + 12
A = INT(Y / 100)
B = 2 − A + INT(A / 4)
JD = INT(365.25 × (Y + 4716)) + INT(30.6001 × (M + 1)) + D + B − 1524.5
```

The Julian Century from the J2000.0 epoch (Meeus Eq. 25.1):

```
T = (JD − 2451545.0) / 36525.0
```

### Solar position (Meeus Chapter 25)

All angles in degrees; T is Julian centuries from J2000.0. The geometric mean longitude: **L₀ = 280.46646 + 36000.76983·T + 0.0003032·T²** (reduced to 0–360°). The mean anomaly: **M = 357.52911 + 35999.05029·T − 0.0001537·T²**. The equation of center:

```
C = (1.914602 − 0.004817·T − 0.000014·T²)·sin(M)
  + (0.019993 − 0.000101·T)·sin(2M)
  + 0.000289·sin(3M)
```

The Sun's true longitude is **L_true = L₀ + C**. The apparent longitude corrects for nutation and aberration: **Ω = 125.04 − 1934.136·T** and **λ_app = L_true − 0.00569 − 0.00478·sin(Ω)**.

The mean obliquity of the ecliptic (Meeus Eq. 22.2):

```
ε₀ = 23.439291 − 0.013004·T − 0.000000164·T² + 0.000000503·T³
```

Corrected for nutation: **ε = ε₀ + 0.00256·cos(Ω)**. Finally, the Sun's right ascension and declination:

```
α_sun = atan2(cos(ε)·sin(λ_app), cos(λ_app))
δ_sun = asin(sin(ε)·sin(λ_app))
```

### Lunar position (Meeus Chapter 47)

The Moon's position requires five fundamental arguments and about 60 periodic terms for longitude, plus additional terms for latitude and distance. The fundamental arguments (in degrees):

- **Mean longitude L′ = 218.3164477 + 481267.88123421·T − 0.0015786·T² + T³/538841 − T⁴/65194000**
- **Mean elongation D = 297.8501921 + 445267.1114034·T − 0.0018819·T² + T³/545868 − T⁴/113065000**
- **Sun's mean anomaly M = 357.5291092 + 35999.0502909·T − 0.0001536·T² + T³/24490000**
- **Moon's mean anomaly M′ = 134.9633964 + 477198.8675055·T + 0.0087414·T² + T³/69699 − T⁴/14712000**
- **Argument of latitude F = 93.2720950 + 483202.0175233·T − 0.0036539·T² − T³/3526000 + T⁴/863310000**

The eccentricity correction **E = 1 − 0.002516·T − 0.0000074·T²** multiplies terms containing M (by E) or 2M (by E²). The six largest terms for **Σl** (longitude correction, coefficients × 10⁻⁶ degrees) are:

| D | M | M′ | F | Coefficient |
|---|---|---|---|---|
| 0 | 0 | 1 | 0 | +6,288,774 |
| 2 | 0 | −1 | 0 | +1,274,027 |
| 2 | 0 | 0 | 0 | +658,314 |
| 0 | 0 | 2 | 0 | +213,618 |
| 0 | 1 | 0 | 0 | −185,116·E |
| 0 | 0 | 0 | 2 | −114,332 |

The full Meeus Table 47.A contains 60 such terms for Σl and a separate table for Σr (distance). Table 47.B contains 60 terms for latitude Σb. Three additive corrections account for Venus (A₁ = 119.75 + 131.849·T), Jupiter (A₂ = 53.09 + 479264.290·T), and Earth flattening (A₃ = 313.45 + 481266.484·T), contributing small corrections to both Σl and Σb.

The Moon's geocentric ecliptic coordinates are:

```
λ_moon = L′ + Σl / 1,000,000    (degrees)
β_moon = Σb / 1,000,000          (degrees)
Δ = 385,000.56 + Σr / 1000       (km)
```

After applying nutation (Δψ) to the longitude, convert to right ascension and declination:

```
α_moon = atan2(sin(λ)·cos(ε) − tan(β)·sin(ε), cos(λ))
δ_moon = asin(sin(β)·cos(ε) + cos(β)·sin(ε)·sin(λ))
```

### Equatorial to horizontal coordinate conversion

Greenwich Apparent Sidereal Time (Meeus Eq. 12.4):

```
θ₀ = 280.46061837 + 360.98564736629·(JD − 2451545.0) + 0.000387933·T² − T³/38710000
```

Local Sidereal Time: **LST = θ₀ + Δψ·cos(ε) + longitude_east**. Hour angle: **H = LST − α**. Then altitude and azimuth:

```
sin(alt) = sin(φ)·sin(δ) + cos(φ)·cos(δ)·cos(H)
Az = atan2(sin(H), cos(H)·sin(φ) − tan(δ)·cos(φ)) + 180°
```

where φ is the observer's latitude. The **+180°** converts from south-origin to north-origin (compass bearing). For the Moon, the critical topocentric parallax correction is:

```
alt_topocentric ≈ alt_geocentric − HP·cos(alt_geocentric)
```

This simplified correction is accurate to ~0.3″ for a sea-level observer. The Moon's altitude can shift by up to **~57 arcminutes** at the horizon — failing to apply this correction completely invalidates results. Atmospheric refraction adds approximately **34′ at the horizon**, computed via Sæmundsson's formula: `R = 1.02′ / tan(alt + 10.3/(alt + 5.11))`.

### Finding sunset time

Sunset occurs when the Sun's geometric center reaches altitude **h₀ = −0.8333°** (accounting for ~16′ semi-diameter + ~34′ standard refraction). The hour angle at sunset:

```
cos(H₀) = (sin(h₀) − sin(φ)·sin(δ_sun)) / (cos(φ)·cos(δ_sun))
```

If |cos(H₀)| > 1, the Sun never sets (polar day) or never rises. The approximate sunset time in UT is derived from the transit time plus H₀/360 of a day. For arc-minute precision, iterate using Meeus's correction formula: **Δm = (alt_computed − h₀) / (360·cos(δ)·cos(φ)·sin(H))** until convergence.

### Best time for observation

The **best time** balances two competing effects: as the Sun sinks further, the sky darkens (helping visibility), but the Moon also descends toward the horizon where atmospheric extinction destroys the faint crescent. Yallop derived from Bruin's (1977) theoretical visibility curves that the optimal moment follows a simple rule:

```
T_best = T_sunset + (4/9) × (T_moonset − T_sunset)
```

The **4/9 fraction** comes from the relationship **4h = 5s** (where h = Moon altitude, s = Sun depression) at the minima of Bruin's constant-width visibility curves. This typically places the best time **30–50 minutes after sunset**, with the Sun about **4° below the horizon** and the Moon at roughly **4–6° altitude**.

For moonset time, use the same algorithm as sunset but with the Moon's coordinates and h₀ = +0.125° (larger apparent diameter, parallax offset).

### New moon conjunction time (Meeus Chapter 49)

For a target year, the approximate lunation number is **k = (year − 2000) × 12.3685**, rounded to the nearest integer for new moon. Then **T = k / 1236.85** and the mean conjunction:

```
JDE = 2451550.09766 + 29.530588861·k + 0.00015437·T² − 0.00000015·T³ + 0.00000000073·T⁴
```

This is corrected by 14 major periodic terms (the largest being **−0.40720·sin(M′)** and **+0.17241·E·sin(M)**) plus 14 small planetary correction terms. The result is in Terrestrial Dynamical Time (TDT); subtract **ΔT/86400** to convert to UT (ΔT ≈ 69.4 seconds in 2026).

### Deriving the visibility parameters

At the best time, compute Sun and Moon horizontal coordinates, then:

```
ARCV = alt_moon − alt_sun                           (degrees)
DAZ  = Az_moon − Az_sun                             (degrees)
ARCL = acos(sin(alt_s)·sin(alt_m) + cos(alt_s)·cos(alt_m)·cos(DAZ))  (degrees)
W    = SD_arcmin × (1 − cos(ARCL))                  (arcminutes)
Age  = (JD_best − JD_conjunction) × 24               (hours)
```

---

## 3. All major visibility criteria with exact thresholds

### Yallop (1997) — the q-value criterion

**Source:** B.D. Yallop, "A Method for Predicting the First Sighting of the New Crescent Moon," NAO Technical Note No. 69, Royal Greenwich Observatory, 1997. Based on ~295 observations from Schaefer's database spanning 1859–1996.

**Formula:** The critical visibility curve ARCV* represents the minimum arc of vision needed for a given crescent width. Yallop fitted a third-degree polynomial to the boundary separating positive from negative observations:

```
ARCV* = 11.8371 − 6.3226·W′ + 0.7319·W′² − 0.1018·W′³
q = (ARCV − ARCV*) / 10
```

where **ARCV is geocentric** (no parallax, no refraction) in degrees at best time, and **W′ is topocentric** crescent width in arcminutes. The division by 10 confines q-values to approximately −1 to +1 for convenience.

**Zone classifications:**

| Zone | q-value | Interpretation |
|------|---------|---------------|
| **A** | q > **+0.216** | Easily visible to the unaided eye |
| **B** | −0.014 < q ≤ +0.216 | Visible under perfect atmospheric conditions |
| **C** | −0.160 < q ≤ −0.014 | May need optical aid to find, then visible to naked eye |
| **D** | −0.232 < q ≤ −0.160 | Only visible with binoculars or telescope |
| **E** | −0.293 < q ≤ −0.232 | Below normal limit for telescope detection |
| **F** | q ≤ **−0.293** | Not visible — below the Danjon limit (ARCL < 7°) |

**Key insight:** Yallop replaced the traditional two-parameter ARCV-vs-DAZ diagram with a single-parameter test using crescent width W as the x-variable. Since W encodes both elongation and lunar distance (via SD), it is a better proxy for crescent brightness than DAZ alone. The q-value measures how far above (+) or below (−) the empirical visibility boundary a given observation falls.

**Limitations:** Uses geocentric ARCV, introducing systematic error by latitude. Dataset of ~295 observations is modest. Not reliable above **±63° latitude**. Does not account for atmospheric conditions, observer altitude, or light pollution. Modern CCD imaging has detected crescents in zones E and F.

### Odeh (2006) — the V-value criterion

**Source:** Mohammad Shawkat Odeh, "New Criterion for Lunar Crescent Visibility," *Experimental Astronomy* 18, pp. 39–64 (2004 volume, published 2006). DOI: 10.1007/s10686-005-9002-5. Based on **737 observations**, approximately half from the Islamic Crescent Observation Project (ICOP).

**Formula:**

```
V = ARCV − (−0.1018·W³ + 0.7319·W² − 6.3226·W + 7.1651)
```

where **ARCV is topocentric airless** (parallax-corrected, no refraction) in degrees, and **W is topocentric** crescent width in arcminutes. Note: **no division by 10**.

**Zone classifications:**

| Zone | V-value | Interpretation |
|------|---------|---------------|
| **A** | V ≥ **+5.65** | Crescent visible by naked eye |
| **B** | +2.00 ≤ V < +5.65 | May need optical aid to find, then visible to naked eye |
| **C** | −0.96 ≤ V < +2.00 | Visible only by optical aid |
| **D** | V < **−0.96** | Not visible even with optical aid |

**Danjon limit:** Odeh found a topocentric minimum elongation of **6.4°**, below which no crescent has been observed even with telescopes. This supersedes Yallop's 7° geocentric limit. For naked-eye visibility, the practical minimum elongation is about **7.7°**.

**Key insight:** The larger dataset (737 vs. 295 observations) and use of topocentric coordinates should improve accuracy. The four-zone classification (vs. Yallop's six) has clearer operational meaning. The explicit treatment of optical-aid observations separates the "telescopic limit" from the "naked-eye limit."

**The polynomial coefficient controversy:** The W³, W², and W¹ coefficients are **identical to Yallop's to five significant digits** (−0.1018, +0.7319, −6.3226). Only the constant differs: 7.1651 vs. 11.8371. Since Yallop divides by 10, the relationship is approximately **V ≈ 10·q + 4.672**. This has been flagged as "quite suspicious" by Guessoum and Meziane (2017), since the two criteria use different datasets and different coordinate systems (geocentric vs. topocentric ARCV), yet produce essentially the same polynomial shape. Odeh's Table V of tabulated ARCV thresholds is also noted as not perfectly consistent with the polynomial fit.

### Shaukat criterion (moonsighting.com)

**Developer:** Syed Khalid Shaukat, consultant to ISNA. Based on approximately 900 observations. **Not published in peer-reviewed literature** — the exact derivation methodology is unavailable for independent assessment.

**Formula (as documented by Özlem 2014):**

```
(M / 12.7) + (W / 1.2) > 1    at sunset
```

where M = topocentric Moon altitude in degrees (minimum limited to 3.4°), W = crescent width in arcminutes.

**Classification:** Binary — visible or not visible. The criterion is evaluated at **sunset** rather than "best time."

**Key insight:** Uses a simple linear relationship between Moon altitude and crescent width, making it computationally trivial. Shaukat claims consistent accuracy since September 1993.

**Limitations:** Unpublished, unverifiable, and not peer-reviewed. Multiple researchers have noted the impossibility of scientific assessment. Despite this, the moonsighting.com maps generated from this criterion are among the most widely consulted worldwide.

### SAAO (South African Astronomical Observatory) criterion

**Source:** J.A.R. Caldwell and C.D. Laney, "First Visibility of the Lunar Crescent," *African Skies* (MNASSA) No. 5, pp. 15–23, 2001.

**Parameters:** Uses **DALT** (apparent altitude of the Moon's **lower limb** at sunset) versus **DAZ** (azimuth difference). Two threshold curves, DALT1 and DALT2, define three zones:

- DALT < DALT1: Visibility **impossible** even with optical aid
- DALT1 ≤ DALT < DALT2: Naked-eye visibility **improbable**; optical aid may help
- DALT ≥ DALT2: Visibility **likely**

The exact DALT1 and DALT2 values are tabulated against DAZ in the original paper and reproduced as Table IV in Odeh's paper.

**Key insight:** Uses the Moon's **lower limb** altitude (not center), directly accounting for atmospheric refraction at the horizon. Developed partly from Southern Hemisphere observations, addressing a gap in Northern-Hemisphere-dominated datasets.

### Istanbul 1978 criterion

**Source:** Istanbul Conference for Hijri Month Determination, 1978. Reaffirmed at the 2016 Istanbul worldwide conference.

**Exact criterion (all three conditions must be met):**

1. Geocentric conjunction occurs **before sunset**
2. Moon altitude **> 5°** at local sunset
3. Geocentric elongation (ARCL) **> 8°** at local sunset

**Classification:** Binary — visible or not visible. No intermediate zones.

**Key insight:** Deliberately conservative, ensuring very high probability of actual sighting when conditions are met. Extremely simple to implement — only two astronomical parameters evaluated at sunset. Adopted by FCNA/ISNA since 2006 and formerly by Turkey's Diyanet.

**Limitations:** Very conservative — rejects many actually visible crescents. The 8° elongation threshold is considerably above the observational Danjon limit (~6.4°). Does not account for latitude, atmospheric conditions, or crescent width.

### Danjon limit

**Source:** André Danjon, "Jeunes et vieilles lunes," *L'Astronomie* 46, 57–66 (1932); "Le croissant lunaire," *L'Astronomie* 50, 57–65 (1936).

**Original value: 7°** — the minimum Sun-Moon elongation below which the crescent arc length shrinks to zero and no crescent is visible. Based on 75 European observational reports.

**Physical explanation:** At very small elongations, the illuminated portion of the Moon is so narrow that the crescent arc (cusp-to-cusp length) shortens below 180° and eventually vanishes. This is partly due to the lunar surface roughness (mountain shadows at grazing illumination angles) and partly due to atmospheric seeing that blurs the already sub-arcsecond-width crescent into invisibility.

**Modern refinements:**

| Researcher | Year | Value | Notes |
|---|---|---|---|
| Danjon | 1932 | **7.0°** | Original, 75 European observations |
| Schaefer | 1991 | **7.0°** | Reaffirmed using Hapke lunar photometric theory |
| Fatoohi et al. | 1998 | **7.5°** | From 503 ancient/modern records |
| Odeh | 2004 | **6.4°** | From 737 ICOP observations (topocentric) |
| Sultan | 2007 | **~5°** | Argued limit can be "broken" with telescopes |
| Segura | 2022 | **5.6°** (exceptional) / **7.1°** (realistic) | Strongly depends on atmospheric extinction coefficient |

**Implementation note:** In practice, apply **ARCL < 6.4°** (Odeh) as a hard pre-check — if this fails, classify as "not visible" regardless of other parameters. For naked-eye-only predictions, use **ARCL < 7.5°**.

### Fotheringham-Maunder criterion

**Sources:** J.K. Fotheringham, "On the Smallest Visible Phase of the Moon," *MNRAS* 70, 527–531 (1910); E.W. Maunder, "On the Smallest Visible Phase of the Moon," *JBAA* 21, 355–362 (1911).

These are the earliest modern criteria, defining visibility regions on an **ARCV vs. DAZ** diagram. Maunder's minimum ARCV values at selected DAZ:

| DAZ | 0° | 5° | 10° | 15° | 20° |
|---|---|---|---|---|---|
| ARCV_min | 11.0° | 10.5° | 9.5° | 8.0° | 6.0° |

Minimum elongation is approximately **11°** (Maunder) or **12°** (Fotheringham). Based on Schmidt's 19th-century observations from Athens.

**Key insight:** Foundational two-parameter approach. All subsequent ARCV-DAZ criteria derive from this work.

**Limitations:** Extremely conservative by modern standards — minimum ARCV of 11° at DAZ=0° is far above the observational record.

### Indian Astronomical Ephemeris criterion

A refinement of Fotheringham-Maunder, tabulated in the *Indian Astronomical Ephemeris* (1996). Minimum ARCV at DAZ=0° is **10.5°**, at DAZ=20° is **5.0°**. Can be approximated as: `ARCV_min = 10.3746 − 0.0137·DAZ − 0.0097·DAZ²`.

### Bruin (1977) criterion

**Source:** F. Bruin, "The First Visibility of the Lunar Crescent," *Vistas in Astronomy* 21, 331–358 (1977).

The first **physically motivated** model. Bruin plotted Moon altitude vs. Sun depression for different crescent widths, incorporating human eye physiology, twilight sky brightness, and atmospheric extinction. His work established the theoretical basis for the "best time" concept — the **4/9 lag rule** used by both Yallop and Odeh derives directly from Bruin's visibility curves.

**Limitations:** Doggett and Schaefer (1994) identified several incorrect assumptions in Bruin's brightness model, including a false presumption that Moon surface brightness depends only on solar depression angle.

### Ilyas criterion

**Source:** Mohammad Ilyas, multiple papers 1983–1994, including "Lunar Crescent Visibility Criterion and Islamic Calendar," *QJRAS* 35, 425–461 (1994).

Ilyas proposed multiple criteria (denoted A, B, C) using ARCV-vs-DAZ diagrams, Moon altitude-vs-elongation curves, and a composite criterion extended for high latitudes. Minimum ARCV at DAZ=0° is approximately **10.3°**. His major conceptual contribution is the **International Lunar Date Line (ILDL)** — a curved line on a world map separating regions where the crescent is visible from those where it is not, analogous to the solar date line but shifting each month.

### Schaefer criterion

**Source:** Bradley E. Schaefer, multiple papers 1987–2000; definitive version: Doggett and Schaefer, "Lunar Crescent Visibility," *Icarus* 107, 388–403 (1994).

The most complex and physically rigorous model. Computes the **contrast** between crescent brightness and twilight sky brightness:

```
Rs = log(R_calc / R_min_visible)
```

where Rs > 0 indicates visibility. The model incorporates atmospheric extinction (Rayleigh and Mie scattering), twilight sky brightness models, lunar surface photometry (Hapke 1984 theory), human eye contrast thresholds (Blackwell 1946 data), light pollution, observer altitude, temperature, and humidity.

Tested against five Moonwatch campaigns (2,000+ observers, 1,534 independent observations), Schaefer's model showed the **least systematic error, least average error, and least maximum error** of all criteria tested.

**Limitations:** Extremely complex — requires atmospheric data that may not be available. Schaefer changed variables across publications (noted by multiple critics). Not reducible to simple thresholds for quick evaluation.

### MABIMS / Neo-MABIMS (Malaysian-regional) criterion

**Source:** Ministers of Religious Affairs of Brunei, Indonesia, Malaysia, and Singapore (MABIMS) meetings, updated 2021.

The **Neo-MABIMS** criterion (adopted 2021/2022) requires **both** conditions at sunset:

- Moon altitude ≥ **3°**
- Geocentric elongation ≥ **6.4°**

The older MABIMS criterion (1992) was more lenient: altitude > 2°, elongation > 3°, OR Moon age > 8 hours. Neo-MABIMS directly references Odeh's 6.4° Danjon limit finding.

### ISNA/FCNA criterion

The Islamic Society of North America / Fiqh Council of North America adopted (since 2006) the **Istanbul 1978 criterion**: elongation ≥ 8° and Moon altitude ≥ 5° at sunset. Applied **globally** — if these conditions are met anywhere on Earth, the month begins. This is not a unique astronomical criterion but a policy decision to use calculations instead of physical sighting.

### Babylonian criterion

**Source:** Fatoohi, Stephenson, and Al-Dargazelli, "The Babylonian First Visibility of the Lunar Crescent: Data and Criterion," *JHA* 30, 51–72 (1999).

The oldest known criterion: Moon age > **24 hours** AND Moon lag time (sunset to moonset) > **48 minutes**. A polynomial fit to 209 Babylonian observations gives: `Lagtime = 8.5635 + 0.0558·DAZ − 0.0158·DAZ² + 0.0002·DAZ³` (lagtime in degrees of time). Minimum elongation from Babylonian data: **~9.8°**.

---

## 4. Comprehensive comparison table

| Criterion | Year | Key Parameters | Zones | Min Elongation | ARCV Type | Evaluation Time |
|---|---|---|---|---|---|---|
| **Fotheringham** | 1910 | ARCV, DAZ | 2 | 12° | Geocentric | Sunset |
| **Maunder** | 1911 | ARCV, DAZ | 2 | 11° | Geocentric | Sunset |
| **Danjon** | 1932 | ARCL only | 2 | 7° | Geocentric | Any |
| **Bruin** | 1977 | Alt_moon, Alt_sun, W | Continuous | ~10° | Geocentric | Variable |
| **Istanbul 1978** | 1978 | Alt_moon, ARCL | 2 | 8° | Geocentric | Sunset |
| **Ilyas** | 1983–94 | ARCV, DAZ (multiple) | 2 | 10–10.5° | Geocentric | Sunset |
| **Schaefer** | 1988–2000 | Physical contrast model | Continuous | ~7° | Topocentric | Variable |
| **Yallop** | 1997 | ARCV, W → q | 6 (A–F) | 7° (Danjon) | Geocentric | Best time |
| **SAAO** | 2001 | DALT (lower limb), DAZ | 3 | ~7° | Apparent | Sunset |
| **Odeh** | 2004/2006 | ARCV, W → V | 4 (A–D) | 6.4° | Topocentric | Best time |
| **Shaukat** | ~1993 | Alt_moon, W | 2 | Unknown | Topocentric | Sunset |
| **Neo-MABIMS** | 2021 | Alt_moon, ARCL | 2 | 6.4° | Geocentric | Sunset |
| **ISNA/FCNA** | 2006 | Alt_moon, ARCL (global) | 2 | 8° | Geocentric | Sunset |

---

## 5. Practical implementation notes

### Using the astronomy-engine npm library

The **astronomy-engine** library (~116 KB minified, zero dependencies, ±1 arcminute accuracy) maps directly to the hilal computation pipeline:

| Hilal Need | Function | Notes |
|---|---|---|
| New Moon time | `SearchMoonPhase(0, startDate)` | Returns exact conjunction time |
| Sunset time | `SearchRiseSet('Sun', observer, -1, date, 300)` | Returns null in polar no-set conditions |
| Moonset time | `SearchRiseSet('Moon', observer, -1, date, 300)` | Handles rapid polar rise-set sequences |
| Moon horizontal coords | `Horizon(time, observer, ra, dec, 'normal')` | Topocentric + refraction-corrected |
| Moon equatorial (topocentric) | `Equator('Moon', time, observer, true, true)` | Automatically applies parallax correction |
| Sun equatorial | `Equator('Sun', time, observer, true, true)` | Negligible parallax (~8.8″) |
| Moon distance | `Equator('Moon', time, observer, ...).dist` | In AU; multiply by 149,597,870.7 for km |
| Elongation | `AngleFromSun('Moon', time)` | Geocentric; compute topocentric from horizontal coords |
| Illumination | `Illumination('Moon', time)` | Returns phase_angle, phase_fraction, distances |
| Twilight time | `SearchAltitude('Sun', observer, -1, date, 300, -6)` | For civil twilight at −6° |

**Critical implementation detail:** When calling `Equator()` with an `Observer` parameter, the library automatically applies topocentric parallax correction. This is essential for the Moon (HP ≈ 57′). For geocentric values (needed by Yallop), call `Equator()` **without** an observer, or pass `null`.

The complete pipeline in pseudocode:

```javascript
const observer = new Astronomy.Observer(lat, lon, elevation);
const conjunction = Astronomy.SearchMoonPhase(0, approxDate);
const sunset = Astronomy.SearchRiseSet('Sun', observer, -1, date, 300);
if (!sunset) return 'NO_SUNSET';  // polar region
const moonset = Astronomy.SearchRiseSet('Moon', observer, -1, date, 300);
if (!moonset || moonset.ut < sunset.ut) return 'MOON_SETS_BEFORE_SUN';
const lag = moonset.ut - sunset.ut;  // in days
const bestTime = sunset.AddDays(lag * 4/9);
// Compute positions at best time...
// Derive ARCV, DAZ, ARCL, W, apply criterion
```

### Precision and performance requirements

**Accuracy:** The astronomy-engine's **±1 arcminute** precision is sufficient for all hilal criteria. Near zone boundaries (e.g., q ≈ +0.216), a 1′ error in ARCV shifts q by ~0.0017 — negligible relative to the zone widths of ~0.05–0.23. The **most critical** requirement is correct parallax correction: omitting it introduces up to 1° error in Moon altitude, which would completely invalidate zone classifications.

**Grid resolution for global maps:** A **2° × 2°** grid (~16,200 points, latitude −60° to +60°) takes about 10 seconds on a single thread and produces good maps. For publication-quality: **1° × 1°** (~64,800 points, ~40–60 seconds). Progressive refinement works well: start at 5° (~2 seconds), then refine to 2° or 1° near zone boundaries.

**Web Worker architecture:** astronomy-engine has zero DOM dependencies and runs perfectly in Web Workers. Divide the grid into N batches (4–8 workers). Each worker computes visibility independently per grid point. Return results as `Float32Array` for efficient transfer. Total bundle overhead: ~116 KB.

**Caching strategy:** The conjunction time is constant across all grid points for a given month — compute once. Sun/Moon geocentric positions change slowly but topocentric corrections vary per point, so `Horizon()` must be called per grid point. For a published calendar, pre-compute all 12 months' maps as JSON and serve statically.

### Edge cases

**Polar regions (|latitude| > 60°):** When `SearchRiseSet` returns null (no sunset), mark the grid point as "N/A." Yallop's algorithm is explicitly stated as unreliable above ±63°. In practice, polar regions are rarely relevant for hilal observation.

**Moon sets before Sun:** If moonset occurs before sunset, the crescent is below the horizon at sunset and cannot be seen. Return "not visible" immediately.

**International Date Line:** Each grid point is evaluated independently at local sunset time. Points near ±180° longitude may have sunset on different calendar dates. This is handled naturally when computing local sunset for each specific date.

**Negative Moon age:** If conjunction has not yet occurred at sunset (JD_sunset < JD_conjunction), the Moon is still in its old crescent phase. Return "conjunction not yet occurred."

---

## 6. Validation against known data

### Ramadan 1447 AH (February–March 2026)

**New Moon conjunction: February 17, 2026, approximately 12:01 UTC.** This is confirmed by multiple sources including ICOP, moonsighting.com, and the Egyptian National Institute of Astronomical Research.

**February 17 evening:** The Moon is extremely young (< 6 hours old at most locations). **Not visible anywhere on Earth** according to all major criteria. Moon age at sunset in the Middle East is approximately 3–4 hours — well below even the most generous thresholds.

**February 18 evening:** Moon age is approximately 27–30 hours depending on longitude. **Visible by naked eye from the Indian subcontinent westward** (India, Middle East, Africa, Europe, Americas). The crescent should be in Yallop Zone A or B for most of the Americas and western Eurasia. NWMI confirms "easily visible by naked eye in all of the United States." Eastern Asia and Australia may be in Zone C (optical aid needed) or marginal.

**February 19 evening:** **Easily visible worldwide** — Zone A everywhere the Moon is above the horizon at sunset.

**Ground truth (actual announcements in 2026):** Saudi Arabia, UAE, and several other Gulf states announced Ramadan starting February 18 based on claimed sightings on February 17 evening. Egypt, Oman, Singapore, Turkey, and most Western communities started February 19 (accepting February 18 evening as the first reliable sighting). This discrepancy between Saudi announcements and astronomical predictions is a well-documented recurring pattern.

### Validation sources and methodology

**Utrecht University maps** (webspace.science.uu.nl/~gent0113) provide Yallop-criterion visibility maps for all months of 1447 AH — three maps per month (conjunction evening, day+1, day+2) in PDF format. These are the most authoritative academic reference for Yallop-based validation.

**moonsighting.com** provides color-coded global visibility maps using the Shaukat criterion for months 1438–1465 AH. Compare zone boundaries against your implementation, noting that Shaukat's criterion produces slightly different boundaries than Yallop/Odeh.

**ICOP (astronomycenter.net)** publishes monthly visibility predictions and maintains the observational database used by Odeh. Their predictions use the Odeh V-value criterion.

**Validation approach:** For a specific date and location, compute ARCV, W, ARCL, DAZ, Moon altitude, and Moon age. Cross-check Moon altitude and azimuth against **JPL Horizons** (ssd.jpl.nasa.gov/horizons) for that exact time and location. Verify the conjunction time against USNO or HMNAO published values. Then apply each criterion and compare zone classifications against published maps from at least two independent sources.

### Existing open-source reference implementations

The **AHC (Accurate Hijri Calculator)** Python package (github.com/accuhijri/ahc, MIT license) uses JPL DE421 ephemeris via Skyfield and implements MABIMS, Odeh, and several other criteria with full global map generation. Its pipeline — conjunction → sunset → positions → parameters → criterion → map — matches the architecture described in this report and serves as the best available code reference for validation.

## Conclusion

The hilal visibility problem, despite millennia of study, remains fundamentally limited by the unpredictability of atmospheric conditions at the horizon. **No geometric criterion can guarantee sighting** — they can only predict probability. The Odeh V-value criterion represents the current best practice for new implementations: it uses the largest observational dataset, employs topocentric coordinates, and provides clear operational zone classifications. However, the suspicious identity of its polynomial coefficients with Yallop's deserves attention.

For implementation, the astronomy-engine library eliminates the need to code ephemeris calculations from scratch while providing sufficient accuracy (±1′). The critical technical requirements are correct topocentric parallax correction for the Moon, proper handling of the "best time" calculation, and awareness that no single criterion is universally accepted across Muslim communities. Building a system that supports multiple criteria — at minimum Yallop, Odeh, and Istanbul 1978 — is the pragmatic approach, letting users select the criterion that matches their community's practice.