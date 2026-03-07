# Programmable Steps for Baseplate Sizing – Canadian Codes

**Primary References**

- CSA S16-19 – Design of steel structures (steel limit states)
- CSA A23.3-19 – Design of concrete structures (anchor & concrete limit states)
- Commonly supplemented by CISC Steel Design Series and AISC Design Guide 1 principles adapted to CSA

**Scope**  
Typical exposed column baseplate connection to concrete foundation/pedestal  
Handles: axial compression/tension, uniaxial or biaxial moment (via eccentricity), shear  
Iterative sizing of plate dimensions (B × N) and thickness (t_bp)

**Resistance Factors (CSA)**

- Steel yielding: φ = 0.90
- Welds: φ_w = 0.67
- Concrete: φ_c = 0.65
- Anchor steel: φ_s = 0.85
- Cracked concrete tension/shear multiplier: typically R = 0.75–0.80 (use project-specific)

## Assumptions & Required Inputs

- **Column**
  - d_col, b_f, t_f, t_w (mm)
  - A_col (mm²), Fy_col (MPa)

- **Loads (factored)**
  - Cf (axial compression, kN) or Tf (axial tension, kN)
  - Mx, My (moments, kN·m)
  - Vy, Vz (shears, kN)

- **Materials**
  - Fy_bp (baseplate, MPa)
  - f'c (concrete compressive strength, MPa)
  - Fu_anc, Fy_anc (anchor rod, MPa)

- **Anchors**
  - n_a (number, usually 4)
  - d_a (nominal diameter, mm), h_ef (effective embedment, mm)
  - Edge distances c_a1, c_a2 (mm), spacing s (mm)

- **Other**
  - Concrete pedestal dimensions → used to determine A₂ (bearing)
  - Weld type/size/electrode strength Xu (MPa)
  - Grout thickness (if projecting bearing area)

- **Initial guesses**  
  Minimum overhang ≈ 75–100 mm  
  Start: B = N = max(d_col, b_f) + 2 × 100 mm  
  Initial t_bp = 20 mm

## Pseudo-Code / Algorithm

```python
def determine_baseplate_size(inputs):
    # 1. Initialize
    overhang = 100          # mm
    B = max(inputs.d_col, inputs.b_f) + 2 * overhang
    N = B                   # start square
    t_bp = 20               # mm
    A1 = B * N

    # Max concrete support area (2:1 spread)
    # Assume pedestal dims B_conc × N_conc known
    A2 = min( (B_conc + 2*grout)**2 , (N_conc + 2*grout)**2 , 4*A1 )  # cap at 4×A1
    sqrt_A2_A1 = min((A2 / A1)**0.5, 2.0)
    phi_pp = 0.65 * 0.85 * inputs.f_c * sqrt_A2_A1   # MPa (bearing resistance)

    converged = False
    max_iters = 20
    iter = 0

    while not converged and iter < max_iters:
        iter += 1
        prev_B, prev_N, prev_t = B, N, t_bp

        # 2. Compression case (Cf > 0)
        if inputs.Cf > 0:
            e = max(inputs.Mx / inputs.Cf, inputs.My / inputs.Cf) * 1000  # mm

            if e <= N / 6:
                # Uniform pressure
                pp = inputs.Cf * 1000 / (B * N)           # MPa
            else:
                # Partial / kern outside
                y = N/2 - e
                if y <= 0:
                    # Treat as tension/uplift
                    goto tension_block
                pp_max = 2 * inputs.Cf * 1000 / (B * y)   # MPa

            # Required area for bearing
            A1_req = inputs.Cf * 1000 / phi_pp
            if A1 < A1_req * 1.05:                        # slight oversize
                scale = (A1_req / A1)**0.5 * 1.05
                B *= scale
                N *= scale
                A1 = B * N
                continue

            # Baseplate bending – cantilever method
            m = (N - 0.95 * inputs.d_col) / 2
            n = (B - 0.80 * inputs.b_f)   / 2
            lambda_cant = max(m, n, (m + n)/2)            # conservative
            Mf_per_mm = pp_max * (lambda_cant**2) / 2     # N·mm/mm
            Z_req = Mf_per_mm / (0.9 * inputs.Fy_bp)
            t_bp_req = (4 * Z_req)**0.5
            t_bp = max(t_bp, round(t_bp_req * 1.1 / 5) * 5)  # to next 5 mm

        # 3. Tension / uplift case
        tension_block:
        if inputs.Tf > 0 or (inputs.Cf > 0 and e > N/2):
            T_per_anc = inputs.Tf / inputs.n_tension_anchors

            # Anchor steel tensile resistance (CSA A23.3 D.6.1 or S16-19)
            A_se = 0.785 * inputs.d_a**2 * 0.9743         # threaded
            Nr = 0.85 * A_se * min(inputs.Fu_anc, 860)    # typical upper limit
            if T_per_anc > Nr:
                # Increase anchor diameter or number
                return "Anchor steel failure - redesign"

            # Concrete breakout tension (CSA A23.3 D.6.2)
            # ... (full calc with A_Nc, ψ_ed,N, ψ_c,N, etc.)
            # Simplified conservative: increase plate if edge breakout governs

            # Plate bending in tension (yield line / cantilever from column)
            # ... similar to compression but moment from anchor eccentricity

        # 4. Shear checks
        Vf = (inputs.Vy**2 + inputs.Vz**2)**0.5

        # Weld shear capacity
        # L_weld ≈ 2*d_col + 2*b_f (fillet around column)
        # vr = 0.67 * 0.707 * t_weld * Xu
        # Check interaction if combined tension + shear

        # Anchor shear + concrete breakout/pryout (CSA A23.3 D.7)

        # 5. Convergence
        size_changed = abs(B - prev_B) > 1 or abs(N - prev_N) > 1
        thick_changed = abs(t_bp - prev_t) > 1

        if not size_changed and not thick_changed:
            converged = True

    if converged:
        # Round to practical dimensions
        B = round(B / 10) * 10
        N = round(N / 10) * 10
        t_bp = round(t_bp / 5) * 5
        return {
            "B_mm": B,
            "N_mm": N,
            "t_bp_mm": t_bp,
            "status": "Converged"
        }
    else:
        return {"status": "Did not converge", "note": "Check inputs or increase iterations"}
```
