# Pseudocode: Factored Compressive Resistance of a Single Equal-Leg Angle

(according to CSA S16-19, Clauses 13.3.1, 13.3.2, 13.3.3)

## Function Definition

```pseudocode
FUNCTION Calculate_Compressive_Resistance_Single_Angle(
    Fy,               // Specified yield strength (MPa)
    E = 200000,       // Modulus of elasticity (MPa)
    A,                // Gross cross-sectional area (mm²)
    rx, ry, rz,       // Radii of gyration about geometric axes x, y, z (mm)
    rv,               // Radius of gyration about minor principal axis v (mm)
    KL                // Effective length KL (mm)
) RETURNS Cr (kN)

    // 1. Calculate actual slenderness ratios (geometric axes)
    slend_x = KL / rx
    slend_y = KL / ry
    slend_z = KL / rz               // usually governs for equal-leg angles

    governing_slend_actual = MAX(slend_x, slend_y, slend_z)

    // 2. Apply Clause 13.3.3.2 modified slenderness for single angles
    IF governing_slend_actual <= 80 THEN
        effective_KL_r = governing_slend_actual
    ELSE
        effective_KL_r = 32 + 1.25 × (KL / rz)
    END IF

    // 3. Apply maximum permitted slenderness (Clause 10.4.2.2)
    effective_KL_r = MIN(effective_KL_r, 200)

    // 4. Compare with 0.95 × (KL / rv) requirement
    slend_principal = 0.95 × (KL / rv)
    effective_KL_r = MAX(effective_KL_r, slend_principal)

    // 5. Elastic buckling stress Fe (MPa)
    Fe = (π² × E) / (effective_KL_r²)

    // 6. Non-dimensional slenderness parameter λ
    lambda = √(Fy / Fe)

    // 7. Compressive strength curve factor (n = 1.34 for hot-rolled sections)
    n = 1.34
    strength_factor = [1 + (lambda^(2 × n))] ^ (-1 / n)

    // 8. Factored compressive resistance Cr (kN)
    phi = 0.90
    Cr = phi × A × Fy × strength_factor / 1000

    RETURN Cr

END FUNCTION
```
