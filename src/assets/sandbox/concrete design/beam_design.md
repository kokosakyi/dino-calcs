To design a rectangular reinforced concrete beam based on the factored maximum moment ($M_f$) and shear force ($V_f$) according to CSA A23.3, follow these steps and formulas:

### Step 1: Determine Preliminary Cross-Sectional Dimensions

The dimensions must be chosen to satisfy both deflection control (Serviceability) and strength (ULS).

- **Minimum Thickness ($h$)**: To avoid detailed deflection calculations, the beam depth should meet the minimums in **Table 9.2**. For a simply supported beam, $h \ge L_n/16$.

**Table 9.2 – Minimum thickness, $h$**

| Member Type                       | Simply Supported | One end continuous | Both ends continuous | Cantilever |
| --------------------------------- | ---------------- | ------------------ | -------------------- | ---------- |
| **Solid one-way slabs**           | $L_n/20$         | $L_n/24$           | $L_n/28$             | $L_n/10$   |
| **Beams or ribbed one-way slabs** | $L_n/16$         | $L_n/18$           | $L_n/21$             | $L_n/8$    |

**Notes:**

1. This Table gives traditional values that provide guidance for preliminary proportioning but are insufficient for beams or one-way slabs supporting partitions or other construction likely to be damaged by large deflections.

2. The values specified in this Table shall be used directly for members with normal-density concrete where $\gamma_c > 2150$ kg/m³ and the reinforcement is Grade 400. For other conditions, the values shall be modified as follows:
   - a) for structural low-density concrete and structural semi-low-density concrete, the values shall be multiplied by $(1.65 - 0.0003\gamma_c)$, but not less than 1.0, where $\gamma_c$ is the density in kilograms per cubic metre; and
   - b) for $f_y$ other than 400 MPa, the values shall be multiplied by $(0.4 + f_y / 670)$.

- **Effective Depth ($d$)**: This is the distance from the extreme compression fibre to the centroid of the tension reinforcement.
  - Calculate $d = h - (\text{concrete cover} + \text{stirrup diameter} + 0.5 \times \text{main bar diameter})$.
  - Minimum cover for beams in non-corrosive environments (**Exposure Class N**) is 30 mm.

**Table 1 – Definitions of C, F, N, A, and S classes of exposure**

| Exposure Class | Description                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C-XL**       | Structurally reinforced concrete exposed to chlorides or other severe environments with or without freezing and thawing conditions, with higher durability performance expectations than the C-1 or A-1 classes.                                                                                                                                                                                                                                         |
| **C-1**        | Structurally reinforced concrete exposed to chlorides with or without freezing and thawing conditions.<br><br>**Examples:** bridge decks, parking decks and ramps, portions of structures exposed to seawater located within the tidal and splash zones, concrete exposed to seawater spray, and salt water pools. For seawater or seawater-spray exposures the requirements for S-3 exposure also have to be met.                                       |
| **C-2**        | Non-structurally reinforced (i.e., plain) concrete exposed to chlorides and freezing and thawing.<br><br>**Examples:** garage floors, porches, steps, pavements, sidewalks, curbs, and gutters.                                                                                                                                                                                                                                                          |
| **C-3**        | Continuously submerged concrete exposed to chlorides, but not to freezing and thawing.<br><br>**Examples:** underwater portions of structures exposed to seawater. For seawater or seawater-spray exposures the requirements for S-3 exposure also have to be met.                                                                                                                                                                                       |
| **C-4**        | Non-structurally reinforced concrete exposed to chlorides, but not to freezing and thawing.<br><br>**Examples:** underground parking slabs on grade.                                                                                                                                                                                                                                                                                                     |
| **F-1**        | Concrete exposed to freezing and thawing in a saturated condition, but not to chlorides.<br><br>**Examples:** pool decks, patios, tennis courts, freshwater pools, and freshwater control structures.                                                                                                                                                                                                                                                    |
| **F-2**        | Concrete in an unsaturated condition exposed to freezing and thawing, but not to chlorides.<br><br>**Examples:** exterior walls and columns.                                                                                                                                                                                                                                                                                                             |
| **N**          | Concrete that when in service is neither exposed to chlorides nor to freezing and thawing nor to sulphates, either in a wet or dry environment.<br><br>**Examples:** footings and interior slabs, walls, and columns.                                                                                                                                                                                                                                    |
| **N-CF**       | Interior concrete floors with a steel-trowel finish that are not exposed to chlorides, nor to sulphates either in a wet or dry environment.<br><br>**Examples:** interior floors, surface covered applications (carpet, vinyl tile) and surface exposed applications (with or without floor hardener), ice-hockey rinks, freezer warehouse floors.                                                                                                       |
| **A-XL**       | Structurally reinforced concrete exposed to severe manure and/or silage gases, with or without freeze-thaw exposure. Concrete exposed to the vapour above municipal sewage or industrial effluent, where hydrogen sulphide gas might be generated, with higher durability performance expectations than A-1 class.                                                                                                                                       |
| **A-1**        | Structurally reinforced concrete exposed to severe manure and/or silage gases, with or without freeze-thaw exposure. Concrete exposed to the vapour above municipal sewage or industrial effluent, where hydrogen sulphide gas might be generated.<br><br>**Examples:** reinforced beams, slabs, and columns over manure pits and silos, canals, and pig slats; and access holes, enclosed chambers, and pipes that are partially filled with effluents. |
| **A-2**        | Structurally reinforced concrete exposed to moderate to severe manure and/or silage gases and liquids, with or without freeze-thaw exposure.<br><br>**Examples:** reinforced walls in exterior manure tanks, silos and feed bunkers, and exterior slabs.                                                                                                                                                                                                 |
| **A-3**        | Structurally reinforced concrete exposed to moderate to severe manure and/or silage gases and liquids, with or without freeze-thaw exposure in a continuously submerged condition. Concrete continuously submerged in municipal or industrial effluents.<br><br>**Examples:** interior gutter walls, beams, slabs, and columns; sewage pipes that are continuously full (e.g., forcemains); and submerged portions of sewage treatment structures.       |
| **A-4**        | Non-structurally reinforced concrete exposed to moderate manure and/or silage gases and liquids, without freeze-thaw exposure.<br><br>**Examples:** interior slabs on grade.                                                                                                                                                                                                                                                                             |
| **S-1**        | Concrete subjected to very severe sulphate exposures (Tables 2 and 3).                                                                                                                                                                                                                                                                                                                                                                                   |
| **S-2**        | Concrete subjected to severe sulphate exposure (Tables 2 and 3).                                                                                                                                                                                                                                                                                                                                                                                         |
| **S-3**        | Concrete subjected to moderate sulphate exposure and to seawater or seawater spray (Tables 2 and 3).                                                                                                                                                                                                                                                                                                                                                     |
| **R-1**        | Residential concrete for footings for walls, columns, fireplaces and chimneys.                                                                                                                                                                                                                                                                                                                                                                           |
| **R-2**        | Residential concrete for foundation walls, grade beams, piers, etc.                                                                                                                                                                                                                                                                                                                                                                                      |
| **R-3**        | Residential concrete for interior slabs on ground not exposed to freezing and thawing or deicing salts.                                                                                                                                                                                                                                                                                                                                                  |

**Notes:**

1. “C” classes pertain to chloride exposure.
2. “F” classes pertain to freezing and thawing exposure without chlorides.
3. “N” class is exposed to neither chlorides nor freezing and thawing.
4. All classes of concrete exposed to sulphates shall comply with the minimum requirements of S class noted in Tables 2 and 3. In particular, Classes A-1 to A-4 in municipal sewage elements could be subjected to sulphate exposure.
5. No hydraulic cement concrete will be entirely resistant in severe acid exposures. The resistance of hydraulic cement concrete in such exposures is largely dependent on its resistance to penetration of fluids.

- **Effective Shear Depth ($d_v$)**: Taken as the greater of $0.9d$ or $0.72h$.

### Step 2: Flexural Design (Reinforcement Calculation)

The beam must be proportioned so that the factored moment resistance ($M_r$) is $\ge$ the factored moment ($M_f$).

1. **Stress Block Factors**: Calculate based on the specified concrete strength ($f'_c$):
   - $\alpha_1 = 0.85 - 0.0015 f'_c \ge 0.67$
   - $\beta_1 = 0.97 - 0.0025 f'_c \ge 0.67$

2. **Required Area of Steel ($A_s$)**: Use the following equilibrium-based formula:
   - $M_r = \phi_s A_s f_y \left( d - \frac{a}{2} \right)$
   - Depth of the rectangular stress block: $a = \frac{\phi_s A_s f_y}{\alpha_1 \phi_c f'_c b}$
   - $\phi_s = 0.85$ and $\phi_c = 0.65$

3. **Refine $A_s$**: Since $a$ depends on $A_s$, this typically requires iteration or solving the quadratic equation for $A_s$.

### Step 3: Verify Reinforcement Limits

- **Minimum Reinforcement ($A_{s,min}$)**: To prevent sudden failure upon cracking, provide at least:
  - $A_{s,min} = \frac{0.2 \sqrt{f'_c}}{f_y} b_t h$

- **Ductility Check ($c/d$ limit)**: To ensure the steel yields before the concrete crushes, the depth to the neutral axis ($c = a / \beta_1$) must satisfy:
  - $\frac{c}{d} \le \frac{700}{700 + f_y}$

### Step 4: Shear Design

The factored shear resistance ($V_r$) must be $\ge$ the factored shear force ($V_f$).

1. **Maximum Shear Limit**: $V_r$ (and $V_f$) cannot exceed $0.25 \phi_c f'_c b_w d_v$.

2. **Concrete Resistance ($V_c$)**:
   - $V_c = \phi_c \lambda \beta \sqrt{f'_c} b_w d_v$
   - Using the Simplified Method, if the section contains minimum transverse reinforcement and $f_y \le 400$ MPa, use $\beta = 0.18$ and $\theta = 35^\circ$.

3. **Steel Resistance ($V_s$)**: If $V_f > V_c$, calculate stirrup area ($A_v$) and spacing ($s$):
   - $V_s = \frac{\phi_s A_v f_y d_v \cot \theta}{s}$

4. **Minimum Shear Reinforcement**: Required if $V_f > V_c$:
   - $A_v \ge 0.06 \sqrt{f'_c} \frac{b_w s}{f_y}$

5. **Maximum Spacing**: $s$ shall not exceed the smaller of $0.7d_v$ or 600 mm. If $V_f$ is high ($> 0.125 \lambda \phi_c f'_c b_w d_v$), reduce these limits by half.

### Step 5: Crack Control Detailing

To control cracking at service loads, the bars must be spaced such that the quantity $z$ does not exceed 30,000 N/mm (interior) or 25,000 N/mm (exterior):

- $z = f_s (d_c A)^{1/3}$
- $f_s$ can be taken as $0.60 f_y$
- Effective clear concrete cover $d_c$ used here is capped at 50 mm.
