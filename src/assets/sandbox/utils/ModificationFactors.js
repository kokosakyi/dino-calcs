class ModificationFactors {

    constructor() {
        this.kd = 1;
        this.ks = 1;
        this.kh = 1;
        this.kt = 1;
        this.kz = 1;
    }

    static KD(loadDuration, PL, PS) {
        switch (loadDuration) {
            case 'Short Term':
                this.kd = 1.15;
                break;
            case 'Standard Term':
                this.kd = 1.0;
                break;
            case 'Long Term':
                if (PL === undefined && PS === undefined) {
                    this.kd = 0.65;
                } else {
                    this.kd = Math.max(1 - 0.5 * Math.log10(PL / PS), 0.65);
                }
                break;
            default:
                this.kd = 1.0;
        }
        return this.kd;
    }

    static KS(property, serviceCondition, leastDimension) {
        switch (property) {
            case 'KSb':
                if (serviceCondition === 'Dry') {
                    this.ks = 1.0;
                } else {
                    if (leastDimension <= 89) {
                        this.ks = 0.84;
                    } else {
                        this.ks = 1.0;
                    }
                }
                break;
            case 'KSf':
                if (serviceCondition === 'Dry') {
                    this.ks = 1.0;
                } else {
                    if (leastDimension <= 89) {
                        this.ks = 0.70;
                    } else {
                        this.ks = 0.70;
                    }
                }
                break;
            case 'KSv':
                if (serviceCondition === 'Dry') {
                    this.ks = 1.0;
                } else {
                    if (leastDimension <= 89) {
                        this.ks = 0.96;
                    } else {
                        this.ks = 1.0;
                    }
                }
                break;
            case 'KSc':
                if (serviceCondition === 'Dry') {
                    this.ks = 1.0;
                } else {
                    if (leastDimension <= 89) {
                        this.ks = 0.69;
                    } else {
                        this.ks = 0.91;
                    }
                }
                break;
            case 'KScp':
                if (serviceCondition === 'Dry') {
                    this.ks = 1.0;
                } else {
                    if (leastDimension <= 89) {
                        this.ks = 0.67;
                    } else {
                        this.ks = 0.67;
                    }
                }
                break;
            case 'KSt':
                if (serviceCondition === 'Dry') {
                    this.ks = 1.0;
                } else {
                    if (leastDimension <= 89) {
                        this.ks = 0.84;
                    } else {
                        this.ks = 1.0;
                    }
                }
                break;
            case 'KSE':
                if (serviceCondition === 'Dry') {
                    this.ks = 1.0;
                } else {
                    if (leastDimension <= 89) {
                        this.ks = 0.94;
                    } else {
                        this.ks = 1.0;
                    }
                }
                break;
            default:
                this.ks = 1.0;

        }
        return this.ks;
    }

    static KH(caseType, specifiedStrength, grading) {
        switch (caseType) {
            case 'Case 1':
                switch (specifiedStrength) {
                    case 'KHb':
                        this.kh = 1.10;
                        break;
                    case 'KHv':
                        this.kh = 1.10;
                        break;
                    case 'KHc':
                        this.kh = 1.10;
                        break;
                    case 'KHt':
                        this.kh = 1.10;
                        break;
                    default:
                        this.kh = 1.0;
                }
                break;
            case 'Case 2':
                if (grading === 'visual') {
                    switch (specifiedStrength) {
                        case 'KHb':
                            this.kh = 1.4;
                            break;
                        case 'KHv':
                            this.kh = 1.4;
                            break;
                        case 'KHc':
                            this.kh = 1.10;
                            break;
                        case 'KHt':
                            this.kh = 0.0;
                            break;
                        default:
                            this.kh = 1.0;
                    }
                } else {
                    switch (specifiedStrength) {
                        case 'KHb':
                            this.kh = 1.2;
                            break;
                        case 'KHv':
                            this.kh = 1.2;
                            break;
                        case 'KHc':
                            this.kh = 1.10;
                            break;
                        case 'KHt':
                            this.kh = 0;
                            break;
                        default:
                            this.kh = 1.0;
                    }
                }
                break;
            default:
                switch (specifiedStrength) {
                    case 'KHb':
                        this.kh = 1.10;
                        break;
                    case 'KHv':
                        this.kh = 1.10;
                        break;
                    case 'KHc':
                        this.kh = 1.0;
                        break;
                    case 'KHt':
                        this.kh = 1.0;
                        break;
                    default:
                        this.kh = 1.0;
                }
        }
        return this.kh;
    }

    static KT(product, serviceCondition, property) {
        if (property) {
            if (serviceCondition === 'Dry') {
                if (product === 'Treated-Incised') {
                    if (property === 'modulusOfElasticity') {
                        this.kt = 0.90;
                    } else {
                        this.kt = 0.75;
                    }
                }
                else {
                    this.kt = 1.0;
                }
            } else {
                if (product === 'Treated-Incised') {
                    if (property === 'modulusOfElasticity') {
                        this.kt = 0.95;
                    } else {
                        this.kt = 0.85;
                    }
                }
                else {
                    this.kt = 1.0;
                }
            }
        } else {
            this.kt = 1.0;
        }
        return this.kt;
    }

    static KZ(b, d, specifiedStrength) {
        let smallerDimension = Math.min(b, d);
        let largerDimension = Math.max(b, d);
        switch (specifiedStrength) {
            case 'KZb':
            case 'KZv':
                if (smallerDimension <= 64) {
                    if (largerDimension <= 89) {
                        this.kz = 1.7;
                    } else if (largerDimension === 114) {
                        this.kz = 1.5;
                    } else if (largerDimension === 140) {
                        this.kz = 1.4;
                    } else if (largerDimension <= 191) {
                        this.kz = 1.2;
                    } else if (largerDimension <= 241) {
                        this.kz = 1.1;
                    } else if (largerDimension <= 292) {
                        this.kz = 1.0;
                    } else if (largerDimension <= 343) {
                        this.kz = 0.9;
                    } else {
                        this.kz = 0.8;
                    }
                } else if (smallerDimension <= 102) {
                    if (largerDimension <= 89) {
                        this.kz = 1.7;
                    } else if (largerDimension === 114) {
                        this.kz = 1.6;
                    } else if (largerDimension === 140) {
                        this.kz = 1.5;
                    } else if (largerDimension <= 191) {
                        this.kz = 1.3;
                    } else if (largerDimension <= 241) {
                        this.kz = 1.2;
                    } else if (largerDimension <= 292) {
                        this.kz = 1.1;
                    } else if (largerDimension <= 343) {
                        this.kz = 1.0;
                    } else {
                        this.kz = 0.9;
                    }
                } else {
                    if (largerDimension <= 89) {
                        this.kz = 1.3;
                    } else if (largerDimension === 114) {
                        this.kz = 1.3;
                    } else if (largerDimension === 140) {
                        this.kz = 1.3;
                    } else if (largerDimension <= 191) {
                        this.kz = 1.3;
                    } else if (largerDimension <= 241) {
                        this.kz = 1.2;
                    } else if (largerDimension <= 292) {
                        this.kz = 1.1;
                    } else if (largerDimension <= 343) {
                        this.kz = 1.0;
                    } else {
                        this.kz = 0.9;
                    }
                }
                break;
            case 'KZt':
                if (largerDimension <= 89) {
                    this.kz = 1.5;
                } else if (largerDimension === 114) {
                    this.kz = 1.4;
                } else if (largerDimension === 140) {
                    this.kz = 1.3;
                } else if (largerDimension <= 191) {
                    this.kz = 1.2;
                } else if (largerDimension <= 241) {
                    this.kz = 1.1;
                } else if (largerDimension <= 292) {
                    this.kz = 1.0;
                } else if (largerDimension <= 343) {
                    this.kz = 0.9;
                } else {
                    this.kz = 0.8;
                }
                break;
            case 'KZcp':
                let b_d = b / d;
                if (b_d <= 1.0) {
                    this.kz = 1.0;
                } else if (b_d >= 2.0) {
                    this.kz = 1.15;
                } else {
                    this.kz = (0.15 * b_d) + 0.85;
                }
                break;
            default:
                this.kz = 1.0;
        }
        return this.kz;
    }
}

export default ModificationFactors;