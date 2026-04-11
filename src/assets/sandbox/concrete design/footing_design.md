# Instructions for Coding a Rectangular Isolated RC Footing Design per CSA A23.3

**Version:** 1.0  
**Date:** April 2026  
**Code References:** CSA A23.3-19 (primary; compatible with A23.3-14 with minor adjustments) and NBCC load combinations.  
**Scope:** This document provides detailed instructions, algorithms, and pseudocode for implementing a design module for **rectangular isolated reinforced concrete footings** (spread footings) under axial gravity loads (centered column). Extendable to eccentric loads or moments later.

**Important Notes**

- Use **Limit States Design (LSD)**.
- Size footing at **Serviceability Limit State (SLS)** for soil bearing.
- Check and design at **Ultimate Limit State (ULS)** for shear, flexure, development, and bearing.
- Footings are typically designed without shear reinforcement (stirrups). Increase thickness if shear fails.
- Assume normal-density concrete (λ = 1.0) unless specified otherwise.
- Resistance factors: φ_c = 0.65, φ_s = 0.85 (cast-in-place).
- Always iterate on self-weight (footing concrete + soil backfill) for accurate pressures.
- For production code: Include input validation, unit consistency (mm, kN, MPa), and detailed output reports with unity ratios.

## 1. Input Parameters

**Geometry**

- Column dimensions: `c_x`, `c_y` (mm) — rectangular or square.
- Column is assumed centered (eccentricity = 0 for base case).

**Loads (Unfactored Service Loads)**

- Dead load from column: `D` (kN).
- Live load from column: `L` (kN).
- Optional: Other loads (wind, seismic) — apply appropriate NBCC combinations.
- Soil unit weight, backfill depth (for self-weight estimation).

**Material Properties**

- Concrete: `f_c` (MPa, specified compressive strength).
- Reinforcement: `f_y` (MPa, typically 400 or 500).
- Concrete density: 24 kN/m³ (normal weight).

**Soil & Geometry Constraints**

- Allowable soil bearing pressure: `q_all` (kPa, SLS, net or gross as per geotech report).
- Footing cover (bottom): 75 mm typical (exposure class dependent; per CSA A23.1).
- Bar diameter(s): User-selected or auto (e.g., 15M, 20M, 25M).
- Minimum footing thickness: Per Clause 15.7 or 13.2.

**Other**

- Load combinations per NBCC (e.g., 1.25D + 1.5L governing for gravity).
- Maximum aspect ratio (L/B ≤ 2 recommended).

## 2. Design Procedure (Step-by-Step Algorithm)

### Step 1: Preliminary Sizing at SLS (Bearing Pressure)

1. Estimate initial footing area (ignore self-weight first):  
   \[
   A*{req} = \frac{D + L}{q*{all}}
   \]

2. Select rectangular dimensions `B` (width) and `L` (length) such that:
   - `B × L ≥ A_req`
   - Aspect ratio reasonable (e.g., `L/B ≤ 2`)
   - Dimensions in practical increments (e.g., 100 mm or 0.1 m).

3. Calculate self-weight of footing + backfill:  
   \[
   W*{self} = (B \times L \times h \times 24) + (B \times L \times \text{backfill depth} \times \gamma*{soil})
   \]  
   (Iterate on `h` later.)

4. Service pressure:  
   \[
   q*s = \frac{D + L + W*{self}}{B \times L} \leq q\_{all}
   \]  
   Adjust `B` and `L` if exceeded. Converge with trial `h`.

### Step 2: Calculate Factored Soil Pressure at ULS (`q_u`)

Use governing NBCC ULS combination (e.g., 1.25D + 1.5L + self-weight factored).  
\[
P_u = \text{factored total load (kN)}
\]  
\[
q_u = \frac{P_u}{B \times L} \quad (\text{kPa})
\]

### Step 3: Determine Effective Depth `d`

- Total thickness `h` (trial, e.g., start at 400–600 mm).
- Effective depth (average for two-way if orthogonal bars differ):  
  \[
  d = h - \text{cover} - \frac{\text{bar diameter}}{2} \quad (\text{or average } d_x, d_y)
  \]  
  (For two-way shear in A23.3-19: use average `d` in orthogonal directions.)

### Step 4: One-Way Shear Check (Clause 11.3 & 13.3.6)

Critical section at distance `d` from column face (cantilever projection).

For direction perpendicular to `B`:

- Cantilever length = `(B - c_x)/2`
- Shear force `V_f` = `q_u ×` cantilever length × `L` (full width).

Concrete shear resistance (simplified, no stirrups):  
\[
V_c = \phi_c \lambda \beta \sqrt{f_c'} \, b_w d
\]  
(where β from MCFT or simplified value per code; often use governing simplified expression).

Require: `V_f ≤ ϕ V_c` (or unity ratio ≤ 1.0).  
If fails → increase `h` or footing size and iterate.

### Step 5: Two-Way (Punching) Shear Check (Clause 13.3.4)

Critical perimeter `b_o` at `d/2` from column faces.  
For rectangular column:  
\[
b_o = 2(c_x + d) + 2(c_y + d)
\]

Punching shear force `V_f` = `q_u ×` (total area outside critical perimeter).

Shear resistance `V_c` = least of three expressions (Clauses 13-5, 13-6, 13-7):  
\[
v_c = \min \left\{
\begin{aligned}
&(1 + 2/\beta_c) \times 0.19 \phi_c \lambda \sqrt{f_c'} \\
&(\alpha_s d / b_o + 0.19) \phi_c \lambda \sqrt{f_c'} \\
&0.38 \phi_c \lambda \sqrt{f_c'}
\end{aligned}
\right.
\]  
(β_c = longer/shorter column side; α_s = 4 interior, 3 edge, 2 corner).

Require: `V_f ≤ ϕ V_c`.  
If fails → increase `h` (most effective) or size.

**Note (A23.3-19):** Effective `d` for punching is average in two directions.

### Step 6: Flexural Design (Clauses 10 & 15.4)

Critical section at face of column (treat as cantilever in each direction).

Moment in x-direction:  
\[
M*f = q_u \times l*{cant,x} \times L \times \frac{l*{cant,x}}{2}
\]  
where `l*{cant,x} = (B - c_x)/2`.

Solve for required `A_s` (quadratic equation or iteration):  
\[
a = \frac{A_s f_y}{0.85 \phi_c f_c' b}, \quad M_r = \phi_s A_s f_y (d - a/2) \geq M_f
\]

- Minimum reinforcement per code (temp/shrinkage or flexural).
- For rectangular footings: Concentrate more reinforcement in shorter direction (Clause 15.4.4).
- Check ductility (c/d limits per A23.3-19 updates).

Repeat for both directions.

### Step 7: Development Length / Anchorage (Clause 12)

- Tension development for footing bars:  
  \[
  l_d = 1.15 k_1 k_2 k_3 k_4 \frac{f_y}{\sqrt{f_c'}} d_b \quad (\text{with modifiers})
  \]  
  Available length must exceed `l_d`.

- Column dowels (compression): Basic `l_{db}` formulas.

- Hooks if needed: `l_{dh}` per code.

Ensure straight embedment or hooks fit within `h - cover`.

### Step 8: Column-Footing Bearing (Clause 10.17 or equivalent)

Bearing resistance usually governs only if column concrete is much weaker.  
Check `P_u` against factored bearing capacity (with increase for supporting area).

### Step 9: Final Checks & Detailing

- Minimum thickness requirements.
- Bar spacing (max/min).
- Development beyond critical sections.
- Output: Dimensions, `h`, reinforcement schedule (bars, spacing, both ways), unity ratios for all checks.
- If any check fails → iterate (`h` in 50 mm increments, then size).

**Convergence Loop**  
Use a while-loop or optimization routine. Increment `h` first (shear/flexure sensitive), then adjust `B/L` if needed. Re-calculate self-weight and `q_u` each iteration.

## 3. Pseudocode / Algorithm for Implementation

```python
import numpy as np  # or use sympy for exact quadratic solve

def design_rect_footing(c_x, c_y, D, L, q_all, f_c, f_y, cover=75, max_aspect=2.0):
    # Step 1: Preliminary sizing
    A_req = (D + L) / q_all
    # Select initial B, L (e.g., make near-square or user-defined)
    B = L = np.sqrt(A_req)  # start square
    h = 500.0  # initial trial thickness (mm)

    tolerance = 0.01
    max_iter = 50
    for iter in range(max_iter):
        # Update self-weight (kN)
        self_weight = (B * L * h / 1e6 * 24) + backfill_contribution  # adjust units

        # Service pressure
        q_s = (D + L + self_weight) / (B * L)
        if q_s > q_all * (1 + tolerance):
            # Increase size
            scale = np.sqrt(q_s / q_all)
            B *= scale
            L *= scale
            continue

        # Step 2: Factored load and q_u (use governing combo, e.g. 1.25D + 1.5L)
        Pu = 1.25 * (D + self_weight) + 1.5 * L   # example
        q_u = Pu / (B * L)

        d = h - cover - 15  # approx, average; refine with bar dia

        # Step 4: One-way shear (both dirs)
        # ... calculate Vf_one_x, Vc_one ... (implement full formulas)
        if Vf_one > phi_Vc_one:
            h += 50
            continue

        # Step 5: Two-way punching shear
        bo = 2*(c_x + d) + 2*(c_y + d)
        Vf_punch = q_u * (B*L - area_inside_perimeter)
        vc = min_of_three_punching_formulas(...)  # Eq 13-5,6,7
        if Vf_punch > phi_c * vc * bo * d:
            h += 50
            continue

        # Step 6: Flexure (both directions)
        # Calculate Mf_x, solve quadratic for As_x
        # Check Mr >= Mf, min As, distribution
        # Repeat for y

        # Step 7: Development length check
        ld = calculate_ld(f_y, f_c, db, modifiers)
        if available_length < ld:
            h += 50
            continue

        # All checks passed
        break

    # Final output
    return {
        "B": B, "L": L, "h": h, "d": d,
        "As_long": As_x, "spacing_long": ...,
        "As_trans": As_y, "unity_shear_one": ...,
        "unity_punch": ..., "unity_flex": ...
    }
```
