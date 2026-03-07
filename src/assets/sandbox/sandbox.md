For the Beam design section for C-channels, the moment of resistance is not soley based on the elastic section modulus but also on the unbraced length of the beam. A similar formula to the plastic moemnt of resistance calculation should be used but this time equations will look like this: 

\\(M_u > 0.67M_y: M_r = 1.15\\phi M_p(1 - 0.28M_y/M_u) \\leq \\phi M_y\\)

"\\(M_u \\leq 0.67M_y: M_r = \\phi M_u\\)"

where M_y = S_y * F_y

NEXT: 

Let's now develop the column design module. Let's start with the W-sections and use the following formulae

C_r=\frac{\emptyset\ast F_y\ast A_g}{{(1+\lambda^{2n})}^\sfrac{1}{n}}
Where n=1.34

\lambda=\sqrt{\frac{F_y}{F_e}}

F_e=\frac{\pi^2\operatorname{E}}{\left(\frac{\operatorname{kL}}{r}\right)^2}
